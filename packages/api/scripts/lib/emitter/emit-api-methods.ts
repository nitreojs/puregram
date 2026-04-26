import ts from 'typescript'
import type { Schema } from '../schema-types'
import { jsDoc } from './ts-factory'
import { formatModule } from './format'
import { versionString } from './load-schema'

export function emitApiMethods (schema: Schema): string {
  const namespaceImport = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamespaceImport(ts.factory.createIdentifier('api'))
    ),
    ts.factory.createStringLiteral('./methods'),
    undefined
  )

  const members: ts.TypeElement[] = schema.methods.map(m => {
    const sig = ts.factory.createPropertySignature(
      undefined,
      ts.factory.createIdentifier(m.name),
      undefined,
      ts.factory.createTypeReferenceNode(`api.${m.name}`)
    )
    return jsDoc(`${m.description}\n\n[bot api docs](${m.documentationLink})`, sig)
  })

  const apiMethodsInterface = ts.factory.createInterfaceDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier('ApiMethods'),
    undefined,
    undefined,
    members
  )

  return formatModule({
    nodes: [apiMethodsInterface],
    imports: [namespaceImport],
    botApiVersion: versionString(schema),
    sourceUrl: schema.source.corefork,
    generatedAt: schema.source.fetchedAt
  })
}
