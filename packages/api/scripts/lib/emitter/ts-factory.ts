import ts from 'typescript'

import type { SchemaTypeRef } from '../schema-types'

export function typeRefToTs (ref: SchemaTypeRef): ts.TypeNode {
  switch (ref.kind) {
    case 'integer':
    case 'float':
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
    case 'string':
      if (ref.enumeration && ref.enumeration.length > 0) {
        return ts.factory.createUnionTypeNode(
          ref.enumeration.map(v =>
            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(v))
          )
        )
      }

      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
    case 'bool':
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
    case 'true':
      return ts.factory.createLiteralTypeNode(ts.factory.createTrue())
    case 'reference':
      return ts.factory.createTypeReferenceNode(`Telegram${ref.name}`)
    case 'array':
      return ts.factory.createArrayTypeNode(typeRefToTs(ref.of))
    case 'union':
      return ts.factory.createUnionTypeNode(ref.of.map(typeRefToTs))
  }
}

export function jsDoc<N extends ts.Node> (text: string, node: N) {
  const lines = text.split('\n').map(l => ` * ${l}`).join('\n')
  const comment = `*\n${lines}\n `

  return ts.addSyntheticLeadingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    comment,
    true
  )
}

export interface MemberSpec {
  name: string
  type: ts.TypeNode
  optional: boolean
  doc?: string
}

export function tsExportInterface (name: string, members: MemberSpec[], doc?: string) {
  const memberNodes: ts.TypeElement[] = members.map((m) => {
    const sig = ts.factory.createPropertySignature(
      undefined,
      ts.factory.createIdentifier(m.name),
      m.optional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
      m.type
    )

    return m.doc ? jsDoc(m.doc, sig) : sig
  })

  const decl = ts.factory.createInterfaceDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(name),
    undefined,
    undefined,
    memberNodes
  )

  return doc ? jsDoc(doc, decl) : decl
}

export function tsExportTypeAlias (name: string, type: ts.TypeNode, doc?: string) {
  const decl = ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(name),
    undefined,
    type
  )

  return doc ? jsDoc(doc, decl) : decl
}

export function importNamed (names: string[], from: string) {
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports(
        names.map(n => ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(n)))
      )
    ),
    ts.factory.createStringLiteral(from),
    undefined
  )
}

export function importTypeNamed (names: string[], from: string) {
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports(
        names.map(n => ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(n)))
      )
    ),
    ts.factory.createStringLiteral(from),
    undefined
  )
}
