import ts from 'typescript'
import type { Schema, SchemaObject, SchemaTypeRef } from '../schema-types'
import { UPDATE_KINDS, type UpdateKindSpec } from './updates-config'
import { analyzeShortcuts, type BoundShortcut } from './shortcut-analyzer'
import { isWrappedStructure } from './structures-config'
import { jsDoc, importTypeNamed, importNamed } from './ts-factory'
import { formatModule } from './format'
import { versionString } from './load-schema'

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

function shortcutNameFor (method: string): string {
  return SHORTCUT_RENAMES[method] ?? method
}

export function emitUpdates (schema: Schema): string {
  const analysis = analyzeShortcuts(schema)
  const objectsByName = new Map<string, SchemaObject>(schema.objects.map(o => [o.name, o]))

  const nodes: ts.Node[] = []

  for (const kind of UPDATE_KINDS) {
    nodes.push(emitUpdateClass(kind, objectsByName, analysis.byKind[kind.kindName] ?? []))
  }

  nodes.push(emitUpdateKindUnion())
  nodes.push(emitUpdateKindMap())

  const referencedTypes = new Set<string>()
  for (const k of UPDATE_KINDS) referencedTypes.add(k.payloadType)

  for (const list of Object.values(analysis.byKind)) {
    for (const sc of list) {
      for (const a of sc.userArgs) collectReferencedTypeNames(a.type, referencedTypes, name => `Telegram${name}`)
    }
  }

  // emit-structures only produces classes for object-kind schema entries; drop union-kind names
  // (MessageOrigin, ChatBoostSource) so wrapper getters fall back to raw types
  const wrappedNames = new Set<string>()
  for (const k of UPDATE_KINDS) {
    const obj = objectsByName.get(k.payloadType.replace(/^Telegram/, ''))
    if (obj?.kind === 'object') {
      for (const f of obj.fields) collectWrapperNames(f.type, wrappedNames)
    }
  }
  for (const name of [...wrappedNames]) {
    const obj = objectsByName.get(name)
    if (!obj || obj.kind !== 'object') wrappedNames.delete(name)
  }

  const paramsImports = new Set<string>()
  for (const list of Object.values(analysis.byKind)) {
    for (const sc of list) paramsImports.add(`${sc.method[0].toUpperCase()}${sc.method.slice(1)}Params`)
  }

  const imports = [
    importTypeNamed([...referencedTypes].sort(), './types'),
    ...(paramsImports.size > 0 ? [importTypeNamed([...paramsImports].sort(), './methods')] : []),
    importTypeNamed(['TelegramLike'], '../telegram-like'),
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
  if (ref.kind === 'reference') into.add(format(ref.name))
  else if (ref.kind === 'array') collectReferencedTypeNames(ref.of, into, format)
  else if (ref.kind === 'union') ref.of.forEach(t => collectReferencedTypeNames(t, into, format))
}

function collectWrapperNames (ref: SchemaTypeRef, into: Set<string>): void {
  if (ref.kind === 'reference' && isWrappedStructure(ref.name)) into.add(ref.name)
  else if (ref.kind === 'array') collectWrapperNames(ref.of, into)
  else if (ref.kind === 'union') ref.of.forEach(t => collectWrapperNames(t, into))
}

function isWrappedObjectClass (objectsByName: Map<string, SchemaObject>, name: string): boolean {
  if (!isWrappedStructure(name)) return false
  const obj = objectsByName.get(name)
  return obj?.kind === 'object'
}

function refToObjectClassName (ref: SchemaTypeRef, objectsByName: Map<string, SchemaObject>): string | undefined {
  if (ref.kind === 'reference' && isWrappedObjectClass(objectsByName, ref.name)) return ref.name
  if (ref.kind === 'array' && ref.of.kind === 'reference' && isWrappedObjectClass(objectsByName, ref.of.name)) return ref.of.name
  return undefined
}

function emitUpdateClass (
  kind: UpdateKindSpec,
  objectsByName: Map<string, SchemaObject>,
  shortcuts: BoundShortcut[]
): ts.ClassDeclaration {
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

  // get x() — lazy-wrap each payload field whose schema entry is a wrapper class
  if (payloadObject?.kind === 'object') {
    for (const f of payloadObject.fields) {
      const wrapperName = refToObjectClassName(f.type, objectsByName)
      if (!wrapperName) continue

      const camelName = camelCase(f.name)
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

      // new Wrapper(this.raw.x), or this.raw.x.map(x => new Wrapper(x))
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

      members.push(jsDoc(f.description, ts.factory.createGetAccessorDeclaration(
        undefined,
        ts.factory.createIdentifier(camelName),
        [],
        returnType,
        ts.factory.createBlock(body, true)
      ) as ts.GetAccessorDeclaration))
    }
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
    members.push(emitShortcutMethod(sc))
  }

  // [INSPECT]()
  members.push(ts.factory.createMethodDeclaration(
    undefined, undefined,
    ts.factory.createComputedPropertyName(ts.factory.createIdentifier('INSPECT')),
    undefined, undefined, [], undefined,
    ts.factory.createBlock([
      ts.factory.createReturnStatement(
        ts.factory.createCallExpression(
          ts.factory.createIdentifier('makeInspect'),
          undefined,
          [ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment('className', ts.factory.createStringLiteral(kind.className)),
            ts.factory.createPropertyAssignment('payload', ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'raw'))
          ], true)]
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

function emitShortcutMethod (sc: BoundShortcut): ts.MethodDeclaration {
  const filledProps = sc.filledArgs.map(anchor => {
    let access: ts.Expression = ts.factory.createThis()
    for (const part of anchor.accessPath) {
      access = ts.factory.createPropertyAccessExpression(access, part)
    }
    return ts.factory.createPropertyAssignment(anchor.schemaArg, access)
  })

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
            ts.factory.createSpreadAssignment(ts.factory.createIdentifier('params'))
          ], true)
        ]
      )
    )
  ], true)

  const paramTypeName = sc.method[0].toUpperCase() + sc.method.slice(1) + 'Params'

  const omitTypeNode = ts.factory.createTypeReferenceNode('Omit', [
    ts.factory.createTypeReferenceNode(paramTypeName),
    ts.factory.createUnionTypeNode(
      sc.filledArgs.map(a => ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(a.schemaArg)))
    )
  ])

  // only default to `{}` when no required user args remain — otherwise a call like `update.send()`
  // would type-check but blow up at runtime instead of erroring at the call site
  const allUserArgsOptional = sc.userArgs.every(a => !a.required)
  const defaultInit = allUserArgsOptional
    ? ts.factory.createObjectLiteralExpression([], false)
    : undefined

  const method = ts.factory.createMethodDeclaration(
    undefined, undefined,
    ts.factory.createIdentifier(shortcutNameFor(sc.method)),
    undefined, undefined,
    [ts.factory.createParameterDeclaration(
      undefined, undefined,
      ts.factory.createIdentifier('params'),
      undefined,
      omitTypeNode,
      defaultInit
    )],
    undefined,
    body
  )

  return jsDoc(`Shortcut for \`tg.api.${sc.method}\`.`, method) as ts.MethodDeclaration
}

function emitUpdateKindUnion (): ts.TypeAliasDeclaration {
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

function emitUpdateKindMap (): ts.InterfaceDeclaration {
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

function camelCase (snake: string): string {
  return snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}
