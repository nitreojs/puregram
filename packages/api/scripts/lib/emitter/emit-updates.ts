import ts from 'typescript'

import type { Schema, SchemaField, SchemaObject, SchemaTypeRef } from '../schema-types'

import { camelCase, getterNameFor } from './field-names'
import { detectWidenedMethodArgs } from './formattable-detect'
import { formatModule } from './format'
import { versionString } from './load-schema'
import { analyzeShortcuts, type BoundShortcut } from './shortcut-analyzer'
import { METHOD_POSITIONALS } from './shortcuts-config'
import { isWrappedStructure } from './structures-config'
import { jsDoc, importTypeNamed, importNamed, typeRefToTs } from './ts-factory'
import { UPDATE_KINDS, type UpdateExtra, type UpdateKindSpec } from './updates-config'

// per-update verb renames — keep separate from telegram-level SHORTCUTS so that
// a method can be a per-update shortcut (e.g. `answer` on CallbackQueryUpdate)
// without also being on the curated telegram-level list
const SHORTCUT_RENAMES: Record<string, string> = {
  sendMessage: 'send',
  forwardMessage: 'forward',
  forwardMessages: 'forwardMany',
  copyMessage: 'copy',
  copyMessages: 'copyMany',
  deleteMessage: 'delete',
  deleteMessages: 'deleteMany',
  editMessageText: 'edit',
  editMessageCaption: 'editCaption',
  editMessageMedia: 'editMedia',
  editMessageReplyMarkup: 'editReplyMarkup',
  editMessageLiveLocation: 'editLiveLocation',
  stopMessageLiveLocation: 'stopLiveLocation',
  pinChatMessage: 'pin',
  unpinChatMessage: 'unpin',
  setMessageReaction: 'react',
  answerCallbackQuery: 'answer',
  answerInlineQuery: 'answer',
  answerShippingQuery: 'answer',
  answerPreCheckoutQuery: 'answer'
}

function shortcutNameFor (method: string) {
  return SHORTCUT_RENAMES[method] ?? method
}

export function emitUpdates (schema: Schema) {
  const analysis = analyzeShortcuts(schema)
  const objectsByName = new Map<string, SchemaObject>(schema.objects.map(o => [o.name, o]))
  const widenedArgs = detectWidenedMethodArgs(schema)

  const nodes: ts.Node[] = []

  for (const kind of UPDATE_KINDS) {
    nodes.push(emitUpdateClass(kind, objectsByName, analysis.byKind[kind.kindName] ?? [], widenedArgs))
  }

  nodes.push(emitUpdateKindUnion())
  nodes.push(emitUpdateKindMap())
  nodes.push(emitUpdateUnion())

  const referencedTypes = new Set<string>()

  for (const k of UPDATE_KINDS) {
    referencedTypes.add(k.payloadType)
  }

  // primitive-field getters pass-through `this.raw.<field>` and emit `typeRefToTs(field.type)`
  // as the return — sweep only the non-wrapped fields so any referenced Telegram* type lands
  // in the import set. wrapped fields use the structures import instead, so adding them here
  // would just produce unused imports
  for (const k of UPDATE_KINDS) {
    const obj = objectsByName.get(k.payloadType.replace(/^Telegram/, ''))

    if (obj?.kind === 'object') {
      for (const f of obj.fields) {
        if (refToObjectClassName(f.type, objectsByName) !== undefined) {
          continue
        }

        collectReferencedTypeNames(f.type, referencedTypes, name => `Telegram${name}`)
      }
    }
  }

  // positional shortcut args inline `typeRefToTs(arg.type)` as the parameter type,
  // so any referenced Telegram* type needs to be imported alongside the payload types
  for (const list of Object.values(analysis.byKind)) {
    for (const sc of list) {
      const anchorArgs = new Set(sc.filledArgs.map(a => a.schemaArg))

      for (const p of METHOD_POSITIONALS[sc.method] ?? []) {
        if (anchorArgs.has(p.schemaArg)) {
          continue
        }

        const arg = sc.userArgs.find(a => a.name === p.schemaArg)

        if (arg) {
          collectReferencedTypeNames(arg.type, referencedTypes, name => `Telegram${name}`)
        }
      }
    }
  }

  // emit-structures only produces classes for object-kind schema entries; drop union-kind names
  // (MessageOrigin, ChatBoostSource) so wrapper getters fall back to raw types
  const wrappedNames = new Set<string>()

  for (const k of UPDATE_KINDS) {
    const obj = objectsByName.get(k.payloadType.replace(/^Telegram/, ''))

    if (obj?.kind === 'object') {
      for (const f of obj.fields) {
        collectWrapperNames(f.type, wrappedNames)
      }
    }
  }

  for (const name of [...wrappedNames]) {
    const obj = objectsByName.get(name)

    if (!obj || obj.kind !== 'object') {
      wrappedNames.delete(name)
    }
  }

  const paramsImports = new Set<string>()

  for (const list of Object.values(analysis.byKind)) {
    for (const sc of list) {
      paramsImports.add(`${sc.method[0].toUpperCase()}${sc.method.slice(1)}Params`)
    }
  }

  const usesHas = UPDATE_KINDS.some((k) => {
    if (k.extras?.some(e => e.returnType.includes('Has<'))) {
      return true
    }

    const obj = objectsByName.get(k.payloadType.replace(/^Telegram/, ''))

    if (obj?.kind !== 'object') {
      return false
    }

    return obj.fields.some(f => !f.required && !/^(has|is)[A-Z]/.test(getterNameFor(f.name)))
  })
  const usesFormattable = [...paramsImports].some((paramsName) => {
    const methodName = paramsName.charAt(0).toLowerCase() + paramsName.slice(1, -'Params'.length)

    return widenedArgs.has(methodName)
  })

  const imports = [
    importTypeNamed([...referencedTypes].sort(), './types'),
    ...(paramsImports.size > 0 ? [importTypeNamed([...paramsImports].sort(), './methods')] : []),
    importTypeNamed(['TelegramLike'], '../telegram-like'),
    ...(usesHas ? [importTypeNamed(['Has'], '../util-types')] : []),
    ...(usesFormattable ? [importTypeNamed(['Formattable'], '../formattable')] : []),
    ...(wrappedNames.size > 0 ? [importNamed([...wrappedNames].sort(), './structures')] : []),
    importNamed(['INSPECT', 'makeInspect'], './inspect')
  ]

  return formatModule({
    nodes,
    imports,
    botApiVersion: versionString(schema),
    sourceUrl: schema.source.corefork,
    generatedAt: schema.source.fetchedAt
  })
}

function collectReferencedTypeNames (
  ref: SchemaTypeRef,
  into: Set<string>,
  format: (name: string) => string
): void {
  if (ref.kind === 'reference') {
    into.add(format(ref.name))
  } else if (ref.kind === 'array') {
    collectReferencedTypeNames(ref.of, into, format)
  } else if (ref.kind === 'union') {
    ref.of.forEach(t => collectReferencedTypeNames(t, into, format))
  }
}

function collectWrapperNames (ref: SchemaTypeRef, into: Set<string>): void {
  if (ref.kind === 'reference' && isWrappedStructure(ref.name)) {
    into.add(ref.name)
  } else if (ref.kind === 'array') {
    collectWrapperNames(ref.of, into)
  } else if (ref.kind === 'union') {
    ref.of.forEach(t => collectWrapperNames(t, into))
  }
}

function isWrappedObjectClass (objectsByName: Map<string, SchemaObject>, name: string) {
  if (!isWrappedStructure(name)) {
    return false
  }

  const obj = objectsByName.get(name)

  return obj?.kind === 'object'
}

function refToObjectClassName (ref: SchemaTypeRef, objectsByName: Map<string, SchemaObject>) {
  if (ref.kind === 'reference' && isWrappedObjectClass(objectsByName, ref.name)) {
    return ref.name
  }

  if (ref.kind === 'array' && ref.of.kind === 'reference' && isWrappedObjectClass(objectsByName, ref.of.name)) {
    return ref.of.name
  }

  return undefined
}

function emitUpdateClass (
  kind: UpdateKindSpec,
  objectsByName: Map<string, SchemaObject>,
  shortcuts: BoundShortcut[],
  widenedArgs: Map<string, Set<string>>
) {
  const members: ts.ClassElement[] = []

  // readonly kind = '<kindName>' as const
  members.push(ts.factory.createPropertyDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
    ts.factory.createIdentifier('kind'),
    undefined,
    undefined,
    ts.factory.createAsExpression(
      ts.factory.createStringLiteral(kind.kindName),
      ts.factory.createTypeReferenceNode('const')
    )
  ))

  const payloadObjectName = kind.payloadType.replace(/^Telegram/, '')
  const payloadObject = objectsByName.get(payloadObjectName)

  // private _x?: Wrapper | Wrapper[]
  if (payloadObject?.kind === 'object') {
    for (const f of payloadObject.fields) {
      const wrapperName = refToObjectClassName(f.type, objectsByName)

      if (wrapperName) {
        const isArray = f.type.kind === 'array'
        const memoType: ts.TypeNode = isArray
          ? ts.factory.createArrayTypeNode(ts.factory.createTypeReferenceNode(wrapperName))
          : ts.factory.createTypeReferenceNode(wrapperName)

        members.push(ts.factory.createPropertyDeclaration(
          [ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword)],
          ts.factory.createIdentifier(`_${camelCase(f.name)}`),
          ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          memoType,
          undefined
        ))
      }
    }
  }

  // constructor (public raw: TelegramX, private tg: TelegramLike) {}
  members.push(ts.factory.createConstructorDeclaration(
    undefined,
    [
      ts.factory.createParameterDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.PublicKeyword)],
        undefined,
        ts.factory.createIdentifier('raw'),
        undefined,
        ts.factory.createTypeReferenceNode(kind.payloadType),
        undefined
      ),
      ts.factory.createParameterDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword)],
        undefined,
        ts.factory.createIdentifier('tg'),
        undefined,
        ts.factory.createTypeReferenceNode('TelegramLike'),
        undefined
      )
    ],
    ts.factory.createBlock([], false)
  ))

  // names already taken by class members emitted above and below — used to suppress
  // schema-driven getters that would otherwise collide
  const reservedNames = new Set<string>(['kind', 'raw', 'tg', 'is'])

  for (const sc of shortcuts) {
    reservedNames.add(shortcutNameFor(sc.method))
  }

  // extras win over auto-emitted has*() — pre-compute names for the skip check below
  const extrasNames = new Set((kind.extras ?? []).map(e => e.name))

  // emit one getter per payload field — wrapper-class fields get a memoized lazy
  // wrap, primitive (and other non-wrapped) fields get a plain pass-through so
  // user code never has to dig through .raw for scalar values
  if (payloadObject?.kind === 'object') {
    for (const f of payloadObject.fields) {
      const camelName = getterNameFor(f.name)

      if (reservedNames.has(camelName)) {
        continue
      }

      reservedNames.add(camelName)

      const wrapperName = refToObjectClassName(f.type, objectsByName)

      if (wrapperName) {
        members.push(emitWrapperGetter(f, camelName, wrapperName))
      } else {
        members.push(emitPrimitiveGetter(f, camelName))
      }
    }
  }

  // hasField() predicates for every optional payload field; has_*/is_* skipped
  // since flag-style true|undefined fields narrow on their own
  if (payloadObject?.kind === 'object') {
    for (const f of payloadObject.fields) {
      if (f.required) {
        continue
      }

      const camelName = getterNameFor(f.name)

      if (/^(has|is)[A-Z]/.test(camelName)) {
        continue
      }

      const hasName = `has${camelName[0].toUpperCase()}${camelName.slice(1)}`

      if (reservedNames.has(hasName) || extrasNames.has(hasName)) {
        continue
      }

      reservedNames.add(hasName)
      members.push(emitAutoHasMethod(f, camelName, hasName))
    }
  }

  // hand-curated helpers from updates-config — `chatId`, `senderId`, `isReply()`,
  // and so on. extras are emitted last so codegen-driven names always win on collision
  for (const extra of kind.extras ?? []) {
    if (reservedNames.has(extra.name)) {
      throw new Error(`extras collision: ${kind.className}.${extra.name} clashes with a generated member`)
    }

    reservedNames.add(extra.name)
    members.push(emitExtra(extra))
  }

  // is<K extends UpdateKind>(kind: K): this is UpdateKindMap[K]
  members.push(ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    ts.factory.createIdentifier('is'),
    undefined,
    [ts.factory.createTypeParameterDeclaration(
      undefined,
      ts.factory.createIdentifier('K'),
      ts.factory.createTypeReferenceNode('UpdateKind')
    )],
    [ts.factory.createParameterDeclaration(
      undefined, undefined,
      ts.factory.createIdentifier('kind'),
      undefined,
      ts.factory.createTypeReferenceNode('K'),
      undefined
    )],
    ts.factory.createTypePredicateNode(
      undefined,
      ts.factory.createThisTypeNode(),
      ts.factory.createIndexedAccessTypeNode(
        ts.factory.createTypeReferenceNode('UpdateKindMap'),
        ts.factory.createTypeReferenceNode('K')
      )
    ),
    ts.factory.createBlock([
      ts.factory.createReturnStatement(
        ts.factory.createBinaryExpression(
          ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'kind'),
          ts.SyntaxKind.EqualsEqualsEqualsToken,
          ts.factory.createAsExpression(
            ts.factory.createIdentifier('kind'),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
          )
        )
      )
    ], true)
  ))

  // codegen'd shortcut methods — send(), forward(), answer(), and so on
  for (const sc of shortcuts) {
    members.push(emitShortcutMethod(sc, widenedArgs))
  }

  // [INSPECT](depth, options, inspect) — forwards node's stylize options for color + js-style output
  const anyType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
  const inspectParam = (name: string) => ts.factory.createParameterDeclaration(
    undefined, undefined, ts.factory.createIdentifier(name), undefined, anyType, undefined
  )

  members.push(ts.factory.createMethodDeclaration(
    undefined, undefined,
    ts.factory.createComputedPropertyName(ts.factory.createIdentifier('INSPECT')),
    undefined, undefined,
    [inspectParam('depth'), inspectParam('options'), inspectParam('inspect')],
    undefined,
    ts.factory.createBlock([
      ts.factory.createReturnStatement(
        ts.factory.createCallExpression(
          ts.factory.createIdentifier('makeInspect'),
          undefined,
          [
            ts.factory.createStringLiteral(kind.className),
            ts.factory.createThis(),
            ts.factory.createIdentifier('depth'),
            ts.factory.createIdentifier('options'),
            ts.factory.createIdentifier('inspect')
          ]
        )
      )
    ], true)
  ))

  return jsDoc(
    `Update for the \`${kind.kindName}\` event.`,
    ts.factory.createClassDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier(kind.className),
      undefined,
      undefined,
      members
    )
  )
}

function parseTypeNode (src: string) {
  const file = ts.createSourceFile('extra.ts', `let _: ${src}`, ts.ScriptTarget.ES2022, false, ts.ScriptKind.TS)
  const stmt = file.statements[0] as ts.VariableStatement
  const type = stmt.declarationList.declarations[0].type

  if (!type) {
    throw new Error(`failed to parse extras returnType: ${src}`)
  }

  return type
}

function parseStatements (src: string) {
  const file = ts.createSourceFile('extra.ts', `(()=>{${src}})()`, ts.ScriptTarget.ES2022, false, ts.ScriptKind.TS)
  const stmt = file.statements[0] as ts.ExpressionStatement
  const callee = (stmt.expression as ts.CallExpression).expression as ts.ParenthesizedExpression
  const fn = callee.expression as ts.ArrowFunction

  if (!ts.isBlock(fn.body)) {
    throw new Error(`failed to parse extras body: ${src}`)
  }

  return [...fn.body.statements]
}

function parseExpression (src: string) {
  const file = ts.createSourceFile('extra.ts', `(${src})`, ts.ScriptTarget.ES2022, false, ts.ScriptKind.TS)
  const stmt = file.statements[0]

  if (!stmt || !ts.isExpressionStatement(stmt) || !ts.isParenthesizedExpression(stmt.expression)) {
    throw new Error(`failed to parse extras expression: ${src}`)
  }

  return stmt.expression.expression
}

function emitExtra (extra: UpdateExtra) {
  const returnType = parseTypeNode(extra.returnType)
  const doc = extra.jsdoc

  if (extra.kind === 'getter') {
    const body = ts.factory.createBlock(
      [ts.factory.createReturnStatement(parseExpression(extra.expression))],
      true
    )
    const node = ts.factory.createGetAccessorDeclaration(
      undefined,
      ts.factory.createIdentifier(extra.name),
      [],
      returnType,
      body
    )

    return doc ? jsDoc(doc, node) : node
  }

  const body = ts.factory.createBlock(parseStatements(extra.body), true)
  const params = extra.params ? parseParams(extra.params) : []
  const node = ts.factory.createMethodDeclaration(
    undefined, undefined,
    ts.factory.createIdentifier(extra.name),
    undefined, undefined, params,
    returnType,
    body
  )

  return doc ? jsDoc(doc, node) : node
}

function parseParams (src: string) {
  const file = ts.createSourceFile('extra.ts', `function _(${src}) {}`, ts.ScriptTarget.ES2022, false, ts.ScriptKind.TS)
  const stmt = file.statements[0] as ts.FunctionDeclaration

  if (!stmt || !ts.isFunctionDeclaration(stmt)) {
    throw new Error(`failed to parse extras params: ${src}`)
  }

  return stmt.parameters.map(p => ts.factory.createParameterDeclaration(
    undefined, undefined, p.name, p.questionToken, p.type, p.initializer
  ))
}

function emitAutoHasMethod (f: SchemaField, camelName: string, hasName: string) {
  const isArray = f.type.kind === 'array'

  const rawAccess = ts.factory.createPropertyAccessExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'raw'),
    f.name
  )

  const notNull = ts.factory.createBinaryExpression(
    rawAccess,
    ts.SyntaxKind.ExclamationEqualsToken,
    ts.factory.createNull()
  )

  const expression: ts.Expression = isArray
    ? ts.factory.createBinaryExpression(
      notNull,
      ts.SyntaxKind.AmpersandAmpersandToken,
      ts.factory.createBinaryExpression(
        ts.factory.createPropertyAccessExpression(rawAccess, 'length'),
        ts.SyntaxKind.GreaterThanToken,
        ts.factory.createNumericLiteral('0')
      )
    )
    : notNull

  const returnType = ts.factory.createTypePredicateNode(
    undefined,
    ts.factory.createThisTypeNode(),
    ts.factory.createTypeReferenceNode('Has', [
      ts.factory.createThisTypeNode(),
      ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(camelName))
    ])
  )

  const method = ts.factory.createMethodDeclaration(
    undefined, undefined,
    ts.factory.createIdentifier(hasName),
    undefined, undefined, [],
    returnType,
    ts.factory.createBlock([ts.factory.createReturnStatement(expression)], true)
  )

  const doc = isArray
    ? `True if \`${f.name}\` has at least one item.`
    : `True if \`${f.name}\` is set.`

  return jsDoc(doc, method)
}

function emitWrapperGetter (f: SchemaField, camelName: string, wrapperName: string) {
  const isArray = f.type.kind === 'array'

  const baseReturn: ts.TypeNode = isArray
    ? ts.factory.createArrayTypeNode(ts.factory.createTypeReferenceNode(wrapperName))
    : ts.factory.createTypeReferenceNode(wrapperName)

  const returnType: ts.TypeNode = f.required
    ? baseReturn
    : ts.factory.createUnionTypeNode([
      baseReturn,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
    ])

  const rawAccess = ts.factory.createPropertyAccessExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'raw'),
    f.name
  )

  const wrapExpr: ts.Expression = isArray
    ? ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(rawAccess, 'map'),
      undefined,
      [ts.factory.createArrowFunction(
        undefined, undefined,
        [ts.factory.createParameterDeclaration(
          undefined, undefined,
          ts.factory.createIdentifier('x'),
          undefined, undefined, undefined
        )],
        undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createNewExpression(
          ts.factory.createIdentifier(wrapperName),
          undefined,
          [ts.factory.createIdentifier('x')]
        )
      )]
    )
    : ts.factory.createNewExpression(
      ts.factory.createIdentifier(wrapperName),
      undefined,
      [rawAccess]
    )

  const memoAssign = ts.factory.createBinaryExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createThis(), `_${camelName}`),
    ts.SyntaxKind.QuestionQuestionEqualsToken,
    wrapExpr
  )

  // required: return memoAssign
  // optional: return rawAccess ? memoAssign : undefined
  const body: ts.Statement[] = f.required
    ? [ts.factory.createReturnStatement(memoAssign)]
    : [
        ts.factory.createReturnStatement(
          ts.factory.createConditionalExpression(
            rawAccess,
            undefined,
            ts.factory.createParenthesizedExpression(memoAssign),
            undefined,
            ts.factory.createIdentifier('undefined')
          )
        )
      ]

  return jsDoc(f.description, ts.factory.createGetAccessorDeclaration(
    undefined,
    ts.factory.createIdentifier(camelName),
    [],
    returnType,
    ts.factory.createBlock(body, true)
  ))
}

function emitPrimitiveGetter (f: SchemaField, camelName: string) {
  const baseReturn = typeRefToTs(f.type)
  const returnType: ts.TypeNode = f.required
    ? baseReturn
    : ts.factory.createUnionTypeNode([
      baseReturn,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
    ])

  const rawAccess = ts.factory.createPropertyAccessExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'raw'),
    f.name
  )

  return jsDoc(f.description, ts.factory.createGetAccessorDeclaration(
    undefined,
    ts.factory.createIdentifier(camelName),
    [],
    returnType,
    ts.factory.createBlock([ts.factory.createReturnStatement(rawAccess)], true)
  ))
}

function emitShortcutMethod (sc: BoundShortcut, widenedArgs: Map<string, Set<string>>) {
  const filledProps = sc.filledArgs.map((anchor) => {
    let access: ts.Expression = ts.factory.createThis()

    for (const part of anchor.accessPath) {
      access = ts.factory.createPropertyAccessExpression(access, part)
    }

    return ts.factory.createPropertyAssignment(anchor.schemaArg, access)
  })

  // primary positional args (e.g. `text` for sendMessage, `latitude`/`longitude` for sendLocation)
  // — drop entries already covered by the update's anchor map; the remaining ones become
  // positional method params and are also forwarded into the api call as named properties
  const anchorArgs = new Set(sc.filledArgs.map(a => a.schemaArg))
  const positionals = (METHOD_POSITIONALS[sc.method] ?? [])
    .filter(p => !anchorArgs.has(p.schemaArg))
    .flatMap((p) => {
      const arg = sc.userArgs.find(a => a.name === p.schemaArg)

      return arg ? [{ ...p, arg }] : []
    })

  // positional args are always required at the call site even if the schema
  // marks them optional — `exactOptionalPropertyTypes` rejects an explicit
  // `undefined` for an optional property, and a primary positional like
  // `setMessageReaction.reaction` is conventionally always supplied (pass `[]`
  // to clear). callers who want to omit it can drop down to `tg.api.<method>`
  const widened = widenedArgs.get(sc.method) ?? new Set<string>()
  const positionalParams = positionals.map((p) => {
    let type = typeRefToTs(p.arg.type)

    if (widened.has(p.schemaArg)) {
      type = ts.factory.createUnionTypeNode([
        type,
        ts.factory.createTypeReferenceNode('Formattable')
      ])
    }

    return ts.factory.createParameterDeclaration(
      undefined, undefined,
      ts.factory.createIdentifier(p.name),
      undefined,
      type,
      undefined
    )
  })

  const positionalProps = positionals.map(p =>
    ts.factory.createPropertyAssignment(p.schemaArg, ts.factory.createIdentifier(p.name))
  )

  const body = ts.factory.createBlock([
    ts.factory.createReturnStatement(
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'tg'),
            'api'
          ),
          sc.method
        ),
        undefined,
        [
          ts.factory.createObjectLiteralExpression([
            ...filledProps,
            ...positionalProps,
            ts.factory.createSpreadAssignment(ts.factory.createIdentifier('params'))
          ], true)
        ]
      )
    )
  ], true)

  const paramTypeName = sc.method[0].toUpperCase() + sc.method.slice(1) + 'Params'
  const omittedNames = [
    ...sc.filledArgs.map(a => a.schemaArg),
    ...positionals.map(p => p.schemaArg)
  ]

  const omitTypeNode = ts.factory.createTypeReferenceNode('Omit', [
    ts.factory.createTypeReferenceNode(paramTypeName),
    ts.factory.createUnionTypeNode(
      omittedNames.map(n => ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(n)))
    )
  ])

  // remaining user args = everything not anchored and not positional
  const positionalArgs = new Set(positionals.map(p => p.schemaArg))
  const restArgs = sc.userArgs.filter(a => !positionalArgs.has(a.name))

  // only default `params` to `{}` when no remaining user args are required —
  // otherwise calling `update.send(text)` should error at the call site if a
  // required user arg is missing rather than blow up at runtime
  const allRestOptional = restArgs.every(a => !a.required)
  const defaultInit = allRestOptional
    ? ts.factory.createObjectLiteralExpression([], false)
    : undefined

  // `params?: ... = {}` is a syntax error — pick exactly one optionality marker.
  // default-init when all rest args are optional so callers can omit `params` entirely
  // and still get a typed empty object inside the api call
  const paramsParam = ts.factory.createParameterDeclaration(
    undefined, undefined,
    ts.factory.createIdentifier('params'),
    undefined,
    omitTypeNode,
    defaultInit
  )

  const method = ts.factory.createMethodDeclaration(
    undefined, undefined,
    ts.factory.createIdentifier(shortcutNameFor(sc.method)),
    undefined, undefined,
    [...positionalParams, paramsParam],
    undefined,
    body
  )

  return jsDoc(`Shortcut for \`tg.api.${sc.method}\`.`, method)
}

function emitUpdateKindUnion () {
  return ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier('UpdateKind'),
    undefined,
    ts.factory.createTypeOperatorNode(
      ts.SyntaxKind.KeyOfKeyword,
      ts.factory.createTypeReferenceNode('UpdateKindMap')
    )
  )
}

function emitUpdateKindMap () {
  return ts.factory.createInterfaceDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier('UpdateKindMap'),
    undefined,
    undefined,
    UPDATE_KINDS.map(k =>
      ts.factory.createPropertySignature(
        undefined,
        ts.factory.createStringLiteral(k.kindName),
        undefined,
        ts.factory.createTypeReferenceNode(k.className)
      )
    )
  )
}

// explicit union of every wrapped Update class. `UpdateKindMap[keyof UpdateKindMap]`
// is equivalent at the tsc level but resolves to `any` under ts-eslint's
// type-checked rules, so we emit the union by listing the classes directly
function emitUpdateUnion () {
  return ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier('Update'),
    undefined,
    ts.factory.createUnionTypeNode(
      UPDATE_KINDS.map(k => ts.factory.createTypeReferenceNode(k.className))
    )
  )
}

