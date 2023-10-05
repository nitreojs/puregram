import ts from 'typescript'

export const syntaxToKind = (kind: ts.SyntaxKind) => ts.SyntaxKind[kind]

export const getText = (node: ts.Identifier | ts.PropertyName | ts.BindingName | ts.EntityName) => (
  (node as ts.Identifier).text
)

export const typeNodeToString = (node: ts.TypeNode): string => {
  const simpleKinds: Partial<Record<ts.SyntaxKind, string>> = {
    [ts.SyntaxKind.StringKeyword]: 'string',
    [ts.SyntaxKind.NumberKeyword]: 'number',
    [ts.SyntaxKind.BooleanKeyword]: 'boolean',
    [ts.SyntaxKind.TrueKeyword]: 'true',
    [ts.SyntaxKind.FalseKeyword]: 'false',
    [ts.SyntaxKind.NullKeyword]: 'null',
    [ts.SyntaxKind.UndefinedKeyword]: 'undefined',
    [ts.SyntaxKind.AnyKeyword]: 'any',
    [ts.SyntaxKind.UnknownKeyword]: 'unknown'
  }

  if (node.kind in simpleKinds) {
    return simpleKinds[node.kind] as string
  }

  if (node.kind === ts.SyntaxKind.ArrayType) {
    const aNode = node as ts.ArrayTypeNode

    return `${typeNodeToString(aNode.elementType)}[]`
  }

  if (node.kind === ts.SyntaxKind.TupleType) {
    const tNode = node as ts.TupleTypeNode

    return `[${tNode.elements.map(e => typeNodeToString(e)).join(', ')}]`
  }

  // TODO
  if (node.kind === ts.SyntaxKind.TypeReference) {
    const rNode = node as ts.TypeReferenceNode

    const name = getText(rNode.typeName)

    return name + (rNode.typeArguments ? `<${(rNode.typeArguments ?? []).map(ta => typeNodeToString(ta)).join(', ')}>` : '')
  }

  throw new Error(`unexpected node ${syntaxToKind(node.kind)}[kind=${node.kind}]`)
}

export const getOriginalClassname = (classname: string) => {
  if (classname.startsWith('Telegram')) {
    return classname.slice('Telegram'.length)
  }

  return classname
}
