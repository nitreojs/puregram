import ts from 'typescript'
import type { Schema, SchemaMethod, SchemaTypeRef } from '../schema-types'
import { typeRefToTs, tsExportInterface, tsExportTypeAlias, importTypeNamed } from './ts-factory'
import { formatModule } from './format'
import { versionString } from './load-schema'

export function emitMethods (schema: Schema): string {
  const nodes: ts.Node[] = []

  const referencedNames = collectReferencedTypeNames(schema)
  const imports = referencedNames.length > 0
    ? [importTypeNamed(referencedNames.map(n => `Telegram${n}`), './types')]
    : []

  for (const method of schema.methods) {
    if (method.arguments.length > 0) {
      nodes.push(emitParamsInterface(method))
    }
    nodes.push(emitMethodAlias(method))
  }

  return formatModule({
    nodes,
    imports,
    botApiVersion: versionString(schema),
    sourceUrl: schema.source.corefork,
    generatedAt: schema.source.fetchedAt
  })
}

function collectReferencedTypeNames (schema: Schema): string[] {
  const names = new Set<string>()
  const walk = (ref: SchemaTypeRef): void => {
    if (ref.kind === 'reference') names.add(ref.name)
    else if (ref.kind === 'array') walk(ref.of)
    else if (ref.kind === 'union') ref.of.forEach(walk)
  }
  for (const m of schema.methods) {
    walk(m.returnType)
    for (const a of m.arguments) walk(a.type)
  }
  return [...names].sort()
}

function pascalCase (name: string): string {
  return name[0].toUpperCase() + name.slice(1)
}

function emitParamsInterface (method: SchemaMethod): ts.Node {
  return tsExportInterface(
    `${pascalCase(method.name)}Params`,
    method.arguments.map(a => ({
      name: a.name,
      type: typeRefToTs(a.type),
      optional: !a.required,
      doc: a.description
    })),
    method.description
  )
}

function emitMethodAlias (method: SchemaMethod): ts.Node {
  const returnType = typeRefToTs(method.returnType)

  const paramSig: ts.ParameterDeclaration[] = method.arguments.length > 0
    ? [ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        ts.factory.createIdentifier('params'),
        undefined,
        ts.factory.createTypeReferenceNode(`${pascalCase(method.name)}Params`),
        undefined
      )]
    : []

  const fnType = ts.factory.createFunctionTypeNode(
    undefined,
    paramSig,
    ts.factory.createTypeReferenceNode('Promise', [returnType])
  )

  return tsExportTypeAlias(method.name, fnType, method.description)
}
