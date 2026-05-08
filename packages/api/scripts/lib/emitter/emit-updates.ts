import ts from 'typescript'

import type { Schema, SchemaField, SchemaObject, SchemaTypeRef } from '../schema-types'

import { camelCase, getterNameFor } from './field-names'
import { formatModule } from './format'
import { detectWidenedMethodArgs } from './formattable-detect'
import { versionString } from './load-schema'
import { analyzeShortcuts, type BoundShortcut } from './shortcut-analyzer'
import { METHOD_POSITIONALS } from './shortcuts-config'
import { ARRAY_WRAPPER_NAMES, arrayWrapperFor, isWrappedStructure } from './structures-config'
import { jsDoc, importTypeNamed, importNamed, typeRefToTs } from './ts-factory'
import { UPDATE_KINDS, type UpdateExtra, type UpdateKindSpec } from './updates-config'

interface WrapperInfo {
  name: string
  isArray: boolean
}

// per-update verb renames — separate from telegram-level SHORTCUTS so a method can be
// a per-update shortcut (`answer` on CallbackQueryUpdate) without joining the telegram-level list
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
  answerPreCheckoutQuery: 'answer',
  answerGuestQuery: 'answer'
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
  nodes.push(emitUpdateKindsConst())

  const referencedTypes = new Set<string>()

  for (const k of UPDATE_KINDS) {
    referencedTypes.add(k.payloadType)
  }

  // sweep only non-wrapped fields into the import set — wrapped fields go through `./structures`,
  // adding them here would just produce unused imports
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

  // positional shortcut args inline their TS type, so any referenced Telegram* needs an import too
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

  // emit-structures only emits classes for object-kind schema entries — drop union-kind names
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

  const usedArrayWrappers = collectUsedArrayWrappers(objectsByName)

  const imports = [
    importTypeNamed([...referencedTypes].sort(), './types'),
    ...(paramsImports.size > 0 ? [importTypeNamed([...paramsImports].sort(), './methods')] : []),
    importTypeNamed(['TelegramLike'], '../telegram-like'),
    ...(usesHas ? [importTypeNamed(['Has'], '../util-types')] : []),
    ...(usesFormattable ? [importTypeNamed(['Formattable'], '../formattable')] : []),
    ...(wrappedNames.size > 0 ? [importNamed([...wrappedNames].sort(), './structures')] : []),
    ...(usedArrayWrappers.length > 0
      ? [importNamed(usedArrayWrappers, '../structures-handcrafted')]
      : []),
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

// field type → wrapper-class output shape. handles synthetic collection wrappers
// (PhotoSize[] → Photo, PhotoSize[][] → Photo[]); undefined for primitives and unwrapped refs
function wrapperInfoFor (
  ref: SchemaTypeRef,
  objectsByName: Map<string, SchemaObject>
) {
  const directSynth = arrayWrapperFor(ref)

  if (directSynth) {
    return { name: directSynth, isArray: false }
  }

  if (ref.kind === 'array') {
    const innerSynth = arrayWrapperFor(ref.of)

    if (innerSynth) {
      return { name: innerSynth, isArray: true }
    }
  }

  if (ref.kind === 'reference' && isWrappedObjectClass(objectsByName, ref.name)) {
    return { name: ref.name, isArray: false }
  }

  if (ref.kind === 'array' && ref.of.kind === 'reference' && isWrappedObjectClass(objectsByName, ref.of.name)) {
    return { name: ref.of.name, isArray: true }
  }

  return undefined
}

function collectUsedArrayWrappers (
  objectsByName: Map<string, SchemaObject>
) {
  const used = new Set<string>()

  for (const k of UPDATE_KINDS) {
    const obj = objectsByName.get(k.payloadType.replace(/^Telegram/, ''))

    if (obj?.kind !== 'object') {
      continue
    }

    for (const f of obj.fields) {
      const direct = arrayWrapperFor(f.type)

      if (direct) {
        used.add(direct)
      }

      if (f.type.kind === 'array') {
        const inner = arrayWrapperFor(f.type.of)

        if (inner) {
          used.add(inner)
        }
      }
    }
  }

  return ARRAY_WRAPPER_NAMES.filter(n => used.has(n))
}

function emitUpdateClass (
  kind: UpdateKindSpec,
  objectsByName: Map<string, SchemaObject>,
  shortcuts: BoundShortcut[],
  widenedArgs: Map<string, Set<string>>
) {
  const members: ts.ClassElement[] = []

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

  if (payloadObject?.kind === 'object') {
    for (const f of payloadObject.fields) {
      const info = wrapperInfoFor(f.type, objectsByName)

      if (info) {
        const memoType: ts.TypeNode = info.isArray
          ? ts.factory.createArrayTypeNode(ts.factory.createTypeReferenceNode(info.name))
          : ts.factory.createTypeReferenceNode(info.name)

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

  // `tg` stays `private` so each update class carries a TS class brand. without it,
  // `AnyUpdate & MessageUpdate` structurally distributes across all 50 union members
  // and `update.is('message')` blows up LSP (measured ~9s on one deferred check).
  // tradeoff: `Modify<…>` drops the brand (Omit can't see private fields), so a modded
  // handler arg passed into a function wanting the raw class needs an `AnyUpdate` cast
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

  // names already taken — suppresses schema-driven getters that would collide
  const reservedNames = new Set<string>(['kind', 'raw', 'tg', 'is'])

  for (const sc of shortcuts) {
    reservedNames.add(shortcutNameFor(sc.method))
  }

  // extras win over auto-emitted has*() — pre-compute names for the skip check below
  const extrasNames = new Set((kind.extras ?? []).map(e => e.name))

  if (payloadObject?.kind === 'object') {
    for (const f of payloadObject.fields) {
      const camelName = getterNameFor(f.name)

      if (reservedNames.has(camelName)) {
        continue
      }

      reservedNames.add(camelName)

      const info = wrapperInfoFor(f.type, objectsByName)

      if (info) {
        members.push(emitWrapperGetter(f, camelName, info))
      } else {
        members.push(emitPrimitiveGetter(f, camelName))
      }
    }
  }

  // hasField() for every optional payload field; skip has_*/is_* — flag-style true|undefined narrows on its own
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
      members.push(emitAutoHasMethod(f, camelName, hasName, objectsByName))
    }
  }

  // hand-curated helpers from updates-config (`chatId`, `senderId`, `isReply()`).
  // emitted last so codegen-driven names win on collision
  for (const extra of kind.extras ?? []) {
    if (reservedNames.has(extra.name)) {
      throw new Error(`extras collision: ${kind.className}.${extra.name} clashes with a generated member`)
    }

    reservedNames.add(extra.name)
    members.push(emitExtra(extra))
  }

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

  for (const sc of shortcuts) {
    members.push(emitShortcutMethod(sc, widenedArgs))
  }

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
    `update for the \`${kind.kindName}\` event`,
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

function buildWrapperReturnType (info: WrapperInfo, optional: boolean) {
  const baseReturn: ts.TypeNode = info.isArray
    ? ts.factory.createArrayTypeNode(ts.factory.createTypeReferenceNode(info.name))
    : ts.factory.createTypeReferenceNode(info.name)

  return optional
    ? ts.factory.createUnionTypeNode([
      baseReturn,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
    ])
    : baseReturn
}

function emitAutoHasMethod (
  f: SchemaField,
  camelName: string,
  hasName: string,
  objectsByName: Map<string, SchemaObject>
) {
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

  // inline `this is this & { camelName: NonNullType }` instead of `Has<this, K>` —
  // chained `hasX() && hasY()` would otherwise nest `Has<Has<…, 'x'>, 'y'>` and re-do
  // `keyof T + T[K] + Exclude<…, undefined>` per layer. flat intersection = ~9× speedup
  const info = wrapperInfoFor(f.type, objectsByName)
  const concreteFieldType = info
    ? buildWrapperReturnType(info, false)
    : typeRefToTs(f.type)

  const returnType = ts.factory.createTypePredicateNode(
    undefined,
    ts.factory.createThisTypeNode(),
    ts.factory.createIntersectionTypeNode([
      ts.factory.createThisTypeNode(),
      ts.factory.createTypeLiteralNode([
        ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier(camelName),
          undefined,
          concreteFieldType
        )
      ])
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
    ? `true if \`${f.name}\` has at least one item`
    : `true if \`${f.name}\` is set`

  return jsDoc(doc, method)
}

function emitWrapperGetter (f: SchemaField, camelName: string, info: WrapperInfo) {
  const baseReturn: ts.TypeNode = info.isArray
    ? ts.factory.createArrayTypeNode(ts.factory.createTypeReferenceNode(info.name))
    : ts.factory.createTypeReferenceNode(info.name)

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

  const wrapExpr: ts.Expression = info.isArray
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
          ts.factory.createIdentifier(info.name),
          undefined,
          [ts.factory.createIdentifier('x')]
        )
      )]
    )
    : ts.factory.createNewExpression(
      ts.factory.createIdentifier(info.name),
      undefined,
      [rawAccess]
    )

  const memoAssign = ts.factory.createBinaryExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createThis(), `_${camelName}`),
    ts.SyntaxKind.QuestionQuestionEqualsToken,
    wrapExpr
  )

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

    if (anchor.nonNull) {
      access = ts.factory.createAsExpression(
        access,
        ts.factory.createTypeReferenceNode('NonNullable', [
          ts.factory.createTypeQueryNode(
            ts.factory.createQualifiedName(
              anchor.accessPath.slice(0, -1).reduce<ts.EntityName>(
                (acc, part) => ts.factory.createQualifiedName(acc, part),
                ts.factory.createIdentifier('this')
              ),
              anchor.accessPath[anchor.accessPath.length - 1]
            )
          )
        ])
      )
    }

    return ts.factory.createPropertyAssignment(anchor.schemaArg, access)
  })

  // primary positional args (e.g. `text` for sendMessage). drop ones already covered by
  // the update's anchor map; remaining become positional params + forwarded as named props
  const anchorArgs = new Set(sc.filledArgs.map(a => a.schemaArg))
  const positionals = (METHOD_POSITIONALS[sc.method] ?? [])
    .filter(p => !anchorArgs.has(p.schemaArg))
    .flatMap((p) => {
      const arg = sc.userArgs.find(a => a.name === p.schemaArg)

      return arg ? [{ ...p, arg }] : []
    })

  // positionals are required at the call site even when the schema marks them optional —
  // `exactOptionalPropertyTypes` rejects explicit `undefined`, and primaries like
  // `setMessageReaction.reaction` are conventionally always supplied (pass `[]` to clear)
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

  const positionalArgs = new Set(positionals.map(p => p.schemaArg))
  const restArgs = sc.userArgs.filter(a => !positionalArgs.has(a.name))

  // default `params` to `{}` only when all remaining user args are optional —
  // otherwise `update.send(text)` should error at the call site, not at runtime
  const allRestOptional = restArgs.every(a => !a.required)
  const defaultInit = allRestOptional
    ? ts.factory.createObjectLiteralExpression([], false)
    : undefined

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

  return jsDoc(`shortcut for \`tg.api.${sc.method}\``, method)
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

// runtime mirror of UpdateKind — consumed by `installDispatchers(tg)` at boot
function emitUpdateKindsConst () {
  return ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList([
      ts.factory.createVariableDeclaration(
        ts.factory.createIdentifier('UPDATE_KINDS'),
        undefined,
        ts.factory.createTypeOperatorNode(
          ts.SyntaxKind.ReadonlyKeyword,
          ts.factory.createArrayTypeNode(ts.factory.createTypeReferenceNode('UpdateKind'))
        ),
        ts.factory.createArrayLiteralExpression(
          UPDATE_KINDS.map(k => ts.factory.createStringLiteral(k.kindName)),
          true
        )
      )
    ], ts.NodeFlags.Const)
  )
}

// explicit union of every wrapped Update class. `UpdateKindMap[keyof …]` is equivalent
// at the tsc level but ts-eslint's type-checked rules resolve it to `any` — so list classes directly
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

