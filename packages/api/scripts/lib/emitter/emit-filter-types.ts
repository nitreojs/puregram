import ts from 'typescript'

import type { Schema } from '../schema-types'

import { formatModule } from './format'
import { versionString } from './load-schema'
import { importTypeNamed, jsDoc } from './ts-factory'
import { UPDATE_KINDS } from './updates-config'

// pre-binds the `Filter` Base parameter to one update class per kind. used as the
// filter type for per-kind dispatchers so TS resolves chains against a monomorphic
// Base instead of distributing intersections across the 50-member `AnyUpdate` union
export function emitFilterTypes (schema: Schema) {
  const nodes: ts.Node[] = UPDATE_KINDS.map((k) =>
    jsDoc(
      `pre-bound \`Filter\` for \`${k.className}\`. compose via \`.and()\` / \`.or()\` to layer Mod refinements`,
      ts.factory.createTypeAliasDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(filterAliasName(k.className)),
        [ts.factory.createTypeParameterDeclaration(
          undefined,
          ts.factory.createIdentifier('Mod'),
          undefined,
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
        )],
        ts.factory.createTypeReferenceNode('Filter', [
          ts.factory.createTypeReferenceNode(k.className),
          ts.factory.createTypeReferenceNode('Mod')
        ])
      )
    )
  )

  // any-update filter — used by tg.onUpdate(filter, h) for cross-kind composition
  nodes.push(jsDoc(
    'cross-kind filter. used by `tg.onUpdate(filter, h)` for predicates that span update kinds',
    ts.factory.createTypeAliasDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier('AnyUpdateFilter'),
      [ts.factory.createTypeParameterDeclaration(
        undefined,
        ts.factory.createIdentifier('Mod'),
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
      )],
      ts.factory.createTypeReferenceNode('Filter', [
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ts.factory.createTypeReferenceNode('Mod')
      ])
    )
  ))

  const imports = [
    importTypeNamed(['Filter'], '../filter-runtime'),
    importTypeNamed(UPDATE_KINDS.map(k => k.className).sort(), './updates')
  ]

  return formatModule({
    nodes,
    imports,
    botApiVersion: versionString(schema),
    sourceUrl: schema.source.corefork,
    generatedAt: schema.source.fetchedAt
  })
}

// `MessageUpdate` → `MessageFilter`, `CallbackQueryUpdate` → `CallbackQueryFilter`,
// `MyChatMemberUpdate` → `MyChatMemberFilter`. drop the trailing `Update` suffix and
// append `Filter` — matches mtcute's naming and reads naturally at use sites
export function filterAliasName (className: string) {
  const stem = className.endsWith('Update') ? className.slice(0, -'Update'.length) : className

  return `${stem}Filter`
}
