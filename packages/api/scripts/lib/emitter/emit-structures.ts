import ts from 'typescript'

import type { Schema, SchemaField, SchemaObject, SchemaTypeRef } from '../schema-types'

import { camelCase, getterNameFor } from './field-names'
import { formatModule } from './format'
import { versionString } from './load-schema'
import { isWrappedStructure } from './structures-config'
import { renderStructureExtras } from './structures-extras'
import { jsDoc, importTypeNamed, importNamed, typeRefToTs } from './ts-factory'

export function emitStructures (schema: Schema) {
  const wrappedObjects = schema.objects.filter(
    // eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate needed for union narrowing
    (o): o is Extract<SchemaObject, { kind: 'object' }> =>
      o.kind === 'object' && isWrappedStructure(o.name)
  )

  // restrict to object-kind entries — union-kind names (MessageOrigin, ChatBoostSource) get no class,
  // so getters referencing them must fall back to raw types instead of a missing wrapper
  const wrappedClassNames = new Set(wrappedObjects.map(o => o.name))

  const nodes: ts.Node[] = []

  for (const obj of wrappedObjects) {
    nodes.push(emitClass(obj, wrappedClassNames))
    nodes.push(...emitSubtypeAliases(obj))
  }

  const referencedTypes = new Set<string>()

  for (const obj of wrappedObjects) {
    referencedTypes.add(`Telegram${obj.name}`)

    for (const f of obj.fields) {
      collectReferencedTypeNames(f.type, referencedTypes)
    }
  }

  const usesHas = wrappedObjects.some(o =>
    o.fields.some(f => !f.required && !/^(has|is)[A-Z]/.test(getterNameFor(f.name)))
  )

  const imports = [
    importTypeNamed([...referencedTypes].sort(), './types'),
    ...(usesHas ? [importTypeNamed(['Has'], '../util-types')] : []),
    importNamed(['INSPECT', 'makeInspect'], './inspect')
  ]

  const printed = formatModule({
    nodes,
    imports,
    botApiVersion: versionString(schema),
    sourceUrl: schema.source.corefork,
    generatedAt: schema.source.fetchedAt
  })

  return spliceExtrasIntoPrinted(printed, wrappedObjects.map(o => o.name))
}

// extras are kept as raw ts text rather than ast nodes because the typescript printer drops
// literal text from cross-source-file ast nodes; splicing post-print sidesteps that entirely
function spliceExtrasIntoPrinted (printed: string, classNames: string[]) {
  let out = printed

  for (const className of classNames) {
    const extrasText = renderStructureExtras(className)

    if (!extrasText) {
      continue
    }

    // anchor on the inspect tail of this specific class (4-space body indent + computed name)
    const classOpen = new RegExp(`^export class ${className} \\{`, 'm')
    const openMatch = classOpen.exec(out)

    if (!openMatch) {
      continue
    }

    const inspectAnchor = '    [INSPECT]('
    const inspectIndex = out.indexOf(inspectAnchor, openMatch.index)

    if (inspectIndex === -1) {
      continue
    }

    out = out.slice(0, inspectIndex) + extrasText + out.slice(inspectIndex)
  }

  return out
}

function collectReferencedTypeNames (ref: SchemaTypeRef, into: Set<string>): void {
  if (ref.kind === 'reference') {
    into.add(`Telegram${ref.name}`)
  } else if (ref.kind === 'array') {
    collectReferencedTypeNames(ref.of, into)
  } else if (ref.kind === 'union') {
    ref.of.forEach(t => collectReferencedTypeNames(t, into))
  }
}

function emitClass (obj: Extract<SchemaObject, { kind: 'object' }>, wrappedClassNames: Set<string>) {
  const className = obj.name
  const rawTypeName = `Telegram${obj.name}`

  const members: ts.ClassElement[] = []

  // private _x?: Wrapper
  for (const f of obj.fields) {
    const wrapperName = wrapperNameFor(f.type, wrappedClassNames)

    if (wrapperName) {
      members.push(ts.factory.createPropertyDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword)],
        ts.factory.createIdentifier(`_${camelCase(f.name)}`),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        wrapperReturnType(f.type, wrapperName, !f.required),
        undefined
      ))
    }
  }

  // constructor (public raw: TelegramX) {}
  members.push(ts.factory.createConstructorDeclaration(
    undefined,
    [ts.factory.createParameterDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.PublicKeyword)],
      undefined,
      ts.factory.createIdentifier('raw'),
      undefined,
      ts.factory.createTypeReferenceNode(rawTypeName),
      undefined
    )],
    ts.factory.createBlock([], false)
  ))

  // static fromPayload (raw): T { return new T(raw) }
  members.push(ts.factory.createMethodDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)],
    undefined,
    ts.factory.createIdentifier('fromPayload'),
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      ts.factory.createIdentifier('raw'),
      undefined,
      ts.factory.createTypeReferenceNode(rawTypeName),
      undefined
    )],
    ts.factory.createTypeReferenceNode(className),
    ts.factory.createBlock([
      ts.factory.createReturnStatement(
        ts.factory.createNewExpression(
          ts.factory.createIdentifier(className),
          undefined,
          [ts.factory.createIdentifier('raw')]
        )
      )
    ], true)
  ))

  // get x() / get y() / and so on
  for (const f of obj.fields) {
    members.push(emitGetter(f, wrappedClassNames))
  }

  for (const f of obj.fields) {
    if (f.required) {
      continue
    }

    const getterName = getterNameFor(f.name)

    if (/^(has|is)[A-Z]/.test(getterName)) {
      continue
    }

    const hasName = `has${getterName[0].toUpperCase()}${getterName.slice(1)}`

    members.push(emitAutoHasMethod(f, getterName, hasName))
  }

  // [INSPECT]()
  members.push(emitInspectMethod(obj))

  return jsDoc(
    obj.description,
    ts.factory.createClassDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier(className),
      undefined,
      undefined,
      members
    )
  )
}

function wrapperNameFor (ref: SchemaTypeRef, wrappedClassNames: Set<string>) {
  if (ref.kind === 'reference' && wrappedClassNames.has(ref.name)) {
    return ref.name
  }

  if (ref.kind === 'array' && ref.of.kind === 'reference' && wrappedClassNames.has(ref.of.name)) {
    return ref.of.name
  }

  return undefined
}

function wrapperReturnType (ref: SchemaTypeRef, wrapperName: string, optional: boolean) {
  let inner: ts.TypeNode = ts.factory.createTypeReferenceNode(wrapperName)

  if (ref.kind === 'array') {
    inner = ts.factory.createArrayTypeNode(inner)
  }

  if (optional) {
    return ts.factory.createUnionTypeNode([
      inner,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
    ])
  }

  return inner
}

function emitGetter (f: SchemaField, wrappedClassNames: Set<string>) {
  const camelName = getterNameFor(f.name)
  const wrapperName = wrapperNameFor(f.type, wrappedClassNames)

  const returnType = wrapperName
    ? wrapperReturnType(f.type, wrapperName, !f.required)
    : (() => {
        const t = typeRefToTs(f.type)

        return f.required
          ? t
          : ts.factory.createUnionTypeNode([t, ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)])
      })()

  let body: ts.Statement[]

  if (wrapperName) {
    if (f.type.kind === 'array') {
      // arrays: lazy map raw → wrapped. optional arrays guard the map() call against undefined
      const memoAssign = ts.factory.createBinaryExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createThis(), `_${camelName}`),
        ts.SyntaxKind.QuestionQuestionEqualsToken,
        buildArrayMap(f.name, wrapperName)
      )
      const rawAccess = ts.factory.createPropertyAccessExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'raw'),
        f.name
      )

      body = f.required
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
    } else if (!f.required) {
      // optional reference: raw.foo ? new Wrapper(raw.foo) : undefined
      body = [
        ts.factory.createIfStatement(
          ts.factory.createStrictEquality(
            ts.factory.createPropertyAccessExpression(ts.factory.createThis(), `_${camelName}`),
            ts.factory.createIdentifier('undefined')
          ),
          ts.factory.createBlock([
            ts.factory.createExpressionStatement(
              ts.factory.createAssignment(
                ts.factory.createPropertyAccessExpression(ts.factory.createThis(), `_${camelName}`),
                ts.factory.createConditionalExpression(
                  ts.factory.createPropertyAccessExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'raw'),
                    f.name
                  ),
                  undefined,
                  ts.factory.createNewExpression(
                    ts.factory.createIdentifier(wrapperName),
                    undefined,
                    [ts.factory.createPropertyAccessExpression(
                      ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'raw'),
                      f.name
                    )]
                  ),
                  undefined,
                  ts.factory.createIdentifier('undefined')
                )
              )
            )
          ], true)
        ),
        ts.factory.createReturnStatement(
          ts.factory.createPropertyAccessExpression(ts.factory.createThis(), `_${camelName}`)
        )
      ]
    } else {
      // required reference: this._x ??= new Wrapper(this.raw.x)
      body = [
        ts.factory.createReturnStatement(
          ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(ts.factory.createThis(), `_${camelName}`),
            ts.SyntaxKind.QuestionQuestionEqualsToken,
            ts.factory.createNewExpression(
              ts.factory.createIdentifier(wrapperName),
              undefined,
              [ts.factory.createPropertyAccessExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'raw'),
                f.name
              )]
            )
          )
        )
      ]
    }
  } else {
    // primitive passthrough: return this.raw.foo
    body = [
      ts.factory.createReturnStatement(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'raw'),
          f.name
        )
      )
    ]
  }

  const getter = ts.factory.createGetAccessorDeclaration(
    undefined,
    ts.factory.createIdentifier(camelName),
    [],
    returnType,
    ts.factory.createBlock(body, true)
  )

  return jsDoc(f.description, getter)
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

function buildArrayMap (rawField: string, wrapperName: string) {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'raw'),
        rawField
      ),
      'map'
    ),
    undefined,
    [ts.factory.createArrowFunction(
      undefined,
      undefined,
      [ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        ts.factory.createIdentifier('x'),
        undefined,
        undefined,
        undefined
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
}

// emit one type alias per literal-discriminator value:
//   `PrivateChat = Omit<Chat, 'type'> & { type: 'private' }`
// only multi-value enumerations qualify — single-value `enumeration: ['photo']`
// already produces a fully-narrowed wrapper class, no alias needed.
//
// `Omit<Chat, 'type'>` is required (rather than plain `Chat & { type: 'X' }`) so the
// class accessor signature gets stripped before the narrowed mod is layered on —
// otherwise chained access (`chat.type`) re-resolves through `Chat.get type()` and
// returns the wide literal union
function emitSubtypeAliases (obj: Extract<SchemaObject, { kind: 'object' }>) {
  const aliases: ts.Node[] = []

  for (const f of obj.fields) {
    if (f.type.kind !== 'string' || !f.type.enumeration || f.type.enumeration.length < 2) {
      continue
    }

    const camelName = camelCase(f.name)

    for (const value of f.type.enumeration) {
      const aliasName = `${literalToPascal(value)}${obj.name}`

      const omitNode = ts.factory.createTypeReferenceNode('Omit', [
        ts.factory.createTypeReferenceNode(obj.name),
        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(camelName))
      ])

      const modNode = ts.factory.createTypeLiteralNode([
        ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier(camelName),
          undefined,
          ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value))
        )
      ])

      const aliasType = ts.factory.createIntersectionTypeNode([omitNode, modNode])

      aliases.push(ts.factory.createTypeAliasDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(aliasName),
        undefined,
        aliasType
      ))
    }
  }

  return aliases
}

// 'private' → 'Private', 'bot_command' → 'BotCommand', 'text_link' → 'TextLink'
function literalToPascal (value: string) {
  return value
    .split(/[_-]/)
    .map(s => s[0].toUpperCase() + s.slice(1))
    .join('')
}

function emitInspectMethod (obj: Extract<SchemaObject, { kind: 'object' }>) {
  const anyType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
  const param = (name: string) => ts.factory.createParameterDeclaration(
    undefined, undefined, ts.factory.createIdentifier(name), undefined, anyType, undefined
  )

  return ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    ts.factory.createComputedPropertyName(ts.factory.createIdentifier('INSPECT')),
    undefined,
    undefined,
    [param('depth'), param('options'), param('inspect')],
    undefined,
    ts.factory.createBlock([
      ts.factory.createReturnStatement(
        ts.factory.createCallExpression(
          ts.factory.createIdentifier('makeInspect'),
          undefined,
          [
            ts.factory.createStringLiteral(obj.name),
            ts.factory.createThis(),
            ts.factory.createIdentifier('depth'),
            ts.factory.createIdentifier('options'),
            ts.factory.createIdentifier('inspect')
          ]
        )
      )
    ], true)
  )
}
