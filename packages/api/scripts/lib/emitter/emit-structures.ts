import ts from 'typescript'
import type { Schema, SchemaField, SchemaObject, SchemaTypeRef } from '../schema-types'
import { isWrappedStructure } from './structures-config'
import { jsDoc, importTypeNamed, importNamed, typeRefToTs } from './ts-factory'
import { formatModule } from './format'
import { versionString } from './load-schema'

export function emitStructures (schema: Schema): string {
  const wrappedObjects = schema.objects.filter(
    (o): o is Extract<SchemaObject, { kind: 'object' }> =>
      o.kind === 'object' && isWrappedStructure(o.name)
  )

  // restrict to object-kind entries — union-kind names (MessageOrigin, ChatBoostSource) get no class,
  // so getters referencing them must fall back to raw types instead of a missing wrapper
  const wrappedClassNames = new Set(wrappedObjects.map(o => o.name))

  const nodes: ts.Node[] = wrappedObjects.map(o => emitClass(o, wrappedClassNames))

  const referencedTypes = new Set<string>()
  for (const obj of wrappedObjects) {
    referencedTypes.add(`Telegram${obj.name}`)
    for (const f of obj.fields) collectReferencedTypeNames(f.type, referencedTypes)
  }

  const imports = [
    importTypeNamed([...referencedTypes].sort(), './types'),
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

function collectReferencedTypeNames (ref: SchemaTypeRef, into: Set<string>): void {
  if (ref.kind === 'reference') into.add(`Telegram${ref.name}`)
  else if (ref.kind === 'array') collectReferencedTypeNames(ref.of, into)
  else if (ref.kind === 'union') ref.of.forEach(t => collectReferencedTypeNames(t, into))
}

function camelCase (snake: string): string {
  return snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function emitClass (obj: Extract<SchemaObject, { kind: 'object' }>, wrappedClassNames: Set<string>): ts.ClassDeclaration {
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

function wrapperNameFor (ref: SchemaTypeRef, wrappedClassNames: Set<string>): string | undefined {
  if (ref.kind === 'reference' && wrappedClassNames.has(ref.name)) return ref.name
  if (ref.kind === 'array' && ref.of.kind === 'reference' && wrappedClassNames.has(ref.of.name)) return ref.of.name
  return undefined
}

function wrapperReturnType (ref: SchemaTypeRef, wrapperName: string, optional: boolean): ts.TypeNode {
  let inner: ts.TypeNode = ts.factory.createTypeReferenceNode(wrapperName)
  if (ref.kind === 'array') inner = ts.factory.createArrayTypeNode(inner)

  if (optional) {
    return ts.factory.createUnionTypeNode([
      inner,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
    ])
  }
  return inner
}

function emitGetter (f: SchemaField, wrappedClassNames: Set<string>): ts.GetAccessorDeclaration {
  const camelName = camelCase(f.name)
  const wrapperName = wrapperNameFor(f.type, wrappedClassNames)

  const returnType = wrapperName
    ? wrapperReturnType(f.type, wrapperName, !f.required)
    : (() => {
        const t = typeRefToTs(f.type)
        return f.required ? t : ts.factory.createUnionTypeNode([t, ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)])
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

  return jsDoc(f.description, getter) as ts.GetAccessorDeclaration
}

function buildArrayMap (rawField: string, wrapperName: string): ts.Expression {
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

function emitInspectMethod (obj: Extract<SchemaObject, { kind: 'object' }>): ts.MethodDeclaration {
  return ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    ts.factory.createComputedPropertyName(ts.factory.createIdentifier('INSPECT')),
    undefined,
    undefined,
    [],
    undefined,
    ts.factory.createBlock([
      ts.factory.createReturnStatement(
        ts.factory.createCallExpression(
          ts.factory.createIdentifier('makeInspect'),
          undefined,
          [ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment('className', ts.factory.createStringLiteral(obj.name)),
            ts.factory.createPropertyAssignment('payload', ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'raw'))
          ], true)]
        )
      )
    ], true)
  )
}
