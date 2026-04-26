import ts from 'typescript'
import type { Schema, SchemaObject } from '../schema-types'
import { typeRefToTs, tsExportInterface, tsExportTypeAlias } from './ts-factory'
import { formatModule } from './format'
import { versionString } from './load-schema'

export function emitTypes (schema: Schema): string {
  const nodes: ts.Node[] = []

  for (const obj of schema.objects) {
    nodes.push(emitObject(obj))
  }

  return formatModule({
    nodes,
    botApiVersion: versionString(schema),
    sourceUrl: schema.source.corefork,
    generatedAt: schema.source.fetchedAt
  })
}

function emitObject (obj: SchemaObject): ts.Node {
  const name = `Telegram${obj.name}`

  if (obj.kind === 'object') {
    return tsExportInterface(
      name,
      obj.fields.map(f => ({
        name: f.name,
        type: typeRefToTs(f.type),
        optional: !f.required,
        doc: f.description
      })),
      obj.description
    )
  }

  if (obj.kind === 'union') {
    return tsExportTypeAlias(
      name,
      ts.factory.createUnionTypeNode(obj.members.map(typeRefToTs)),
      obj.description
    )
  }

  return tsExportTypeAlias(
    name,
    ts.factory.createUnionTypeNode(
      obj.values.map(v =>
        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(v))
      )
    ),
    obj.description
  )
}
