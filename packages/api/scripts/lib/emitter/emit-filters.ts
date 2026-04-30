import ts from 'typescript'

import type { Schema, SchemaObject } from '../schema-types'

import { getterNameFor } from './field-names'
import { formatModule } from './format'
import { versionString } from './load-schema'
import { importNamed, importTypeNamed, jsDoc } from './ts-factory'
import { UPDATE_KINDS } from './updates-config'

// codegen layer for the public filter set in `puregram/filters`. emits two families:
//
// 1. presence filters — one per camelCased optional payload field, with `kinds` metadata
//    listing the update kinds where that field exists. mirrors the per-class `hasX()`
//    type-guards already emitted on update classes by emit-updates.ts; the standalone
//    filter form lets users compose them via `and(hasText, chat.private)`
//
// 2. update-kind shorthand — `kind(k)` callable plus per-kind property shortcuts
//    (`kind.message`, `kind.editedMessage`). property names follow the snake → camel
//    convention so `kind.callback_query` reads as `kind.callbackQuery`. `action(t)` is
//    the service-event subset of `kind`, scoped to `derived` UPDATE_KINDS

export function emitFilters (schema: Schema) {
  const objectsByName = new Map<string, SchemaObject>(schema.objects.map(o => [o.name, o]))

  // walk every update kind, accumulate (camelGetter -> set of update kinds) for
  // optional payload fields. mirrors the predicate emission rule in emit-updates.ts:
  // exclude required fields (no `hasX` makes sense), exclude getters that already
  // start with `has`/`is` (they self-describe), exclude `extras`-defined names that
  // would collide with curated helpers
  const presence = new Map<string, { kinds: string[], cls: string[] }>()

  for (const k of UPDATE_KINDS) {
    const obj = objectsByName.get(k.payloadType.replace(/^Telegram/, ''))

    if (obj?.kind !== 'object') {
      continue
    }

    const extrasNames = new Set((k.extras ?? []).map(e => e.name))

    for (const f of obj.fields) {
      if (f.required) {
        continue
      }

      const camelName = getterNameFor(f.name)

      if (/^(has|is)[A-Z]/.test(camelName)) {
        continue
      }

      const hasName = `has${camelName[0].toUpperCase()}${camelName.slice(1)}`

      if (extrasNames.has(hasName)) {
        continue
      }

      let entry = presence.get(camelName)

      if (!entry) {
        entry = { kinds: [], cls: [] }
        presence.set(camelName, entry)
      }

      entry.kinds.push(k.kindName)
      entry.cls.push(k.className)
    }
  }

  const nodes: ts.Node[] = []

  const presenceNames = [...presence.keys()].sort()

  for (const camelName of presenceNames) {
    const entry = presence.get(camelName)

    if (!entry) {
      continue
    }

    const hasName = `has${camelName[0].toUpperCase()}${camelName.slice(1)}`

    nodes.push(emitPresenceFilter(hasName, camelName, entry.kinds, entry.cls))
  }

  nodes.push(emitKindCallable())
  nodes.push(emitKindShorthand())

  for (const node of emitActionCallable()) {
    nodes.push(node)
  }

  nodes.push(emitActionShorthand())

  // presence filters and kind/action shorthands type via `UpdateKindMap[K]` and
  // `Filter<AnyUpdate>` — no direct update-class refs needed at the .ts level
  const imports = [
    importNamed(['defineFilter'], '../filter-runtime'),
    importTypeNamed(['Filter'], '../filter-runtime'),
    importTypeNamed(['AnyUpdate'], '../custom-update'),
    importTypeNamed(['UpdateKind', 'UpdateKindMap'], './updates')
  ]

  return formatModule({
    nodes,
    imports,
    botApiVersion: versionString(schema),
    sourceUrl: schema.source.corefork,
    generatedAt: schema.source.fetchedAt
  })
}

function emitPresenceFilter (hasName: string, camelName: string, kinds: string[], _classNames: string[]) {
  // Base is `unknown` (not `AnyUpdate`) so chaining `kind.X.and(hasField)` resolves
  // to `kind.X`'s narrow Base via `MessageUpdate & unknown = MessageUpdate` —
  // clean simplification with no union distribution. Mod stamps the field as
  // present so handler intersection flips `string | undefined` to `string`.
  // `NonNullable<unknown>` resolves to `{}` but reads cleaner and dodges
  // `@typescript-eslint/ban-types`
  const presentMarker = ts.factory.createTypeReferenceNode('NonNullable', [
    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
  ])

  const filterType = ts.factory.createTypeReferenceNode('Filter', [
    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
    ts.factory.createTypeLiteralNode([
      ts.factory.createPropertySignature(
        undefined,
        ts.factory.createIdentifier(camelName),
        undefined,
        presentMarker
      )
    ])
  ])

  const predicate = ts.factory.createArrowFunction(
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(
      undefined, undefined, ts.factory.createIdentifier('u'), undefined,
      ts.factory.createTypeReferenceNode('AnyUpdate'), undefined
    )],
    ts.factory.createTypePredicateNode(
      undefined,
      ts.factory.createIdentifier('u'),
      ts.factory.createTypeReferenceNode('AnyUpdate')
    ),
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createParenthesizedExpression(
      // (u as { camelName?: unknown }).camelName != null
      ts.factory.createBinaryExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createParenthesizedExpression(
            ts.factory.createAsExpression(
              ts.factory.createIdentifier('u'),
              ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                  undefined,
                  ts.factory.createIdentifier(camelName),
                  ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                )
              ])
            )
          ),
          camelName
        ),
        ts.SyntaxKind.ExclamationEqualsToken,
        ts.factory.createNull()
      )
    )
  )

  const meta = ts.factory.createObjectLiteralExpression([
    ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier('kinds'),
      ts.factory.createArrayLiteralExpression(
        kinds.map(k => ts.factory.createStringLiteral(k)),
        false
      )
    )
  ], false)

  const call = ts.factory.createCallExpression(
    ts.factory.createIdentifier('defineFilter'),
    undefined,
    [
      ts.factory.createStringLiteral(hasName),
      predicate,
      meta
    ]
  )

  const decl = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(
        ts.factory.createIdentifier(hasName),
        undefined,
        filterType,
        call
      )],
      ts.NodeFlags.Const
    )
  )

  return jsDoc(`Filter — true if the update has \`${camelName}\` set.`, decl)
}

function camelizeKind (snake: string) {
  return snake.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function emitKindCallable () {
  // function _kind<K extends UpdateKind>(k: K): Filter<UpdateKindMap[K]>
  const decl = ts.factory.createFunctionDeclaration(
    undefined,
    undefined,
    ts.factory.createIdentifier('_kind'),
    [ts.factory.createTypeParameterDeclaration(
      undefined,
      ts.factory.createIdentifier('K'),
      ts.factory.createTypeReferenceNode('UpdateKind')
    )],
    [ts.factory.createParameterDeclaration(
      undefined, undefined,
      ts.factory.createIdentifier('k'),
      undefined,
      ts.factory.createTypeReferenceNode('K'),
      undefined
    )],
    ts.factory.createTypeReferenceNode('Filter', [
      ts.factory.createIndexedAccessTypeNode(
        ts.factory.createTypeReferenceNode('UpdateKindMap'),
        ts.factory.createTypeReferenceNode('K')
      )
    ]),
    ts.factory.createBlock([
      ts.factory.createReturnStatement(
        ts.factory.createCallExpression(
          ts.factory.createIdentifier('defineFilter'),
          undefined,
          [
            ts.factory.createTemplateExpression(
              ts.factory.createTemplateHead('kind.'),
              [ts.factory.createTemplateSpan(
                ts.factory.createIdentifier('k'),
                ts.factory.createTemplateTail('')
              )]
            ),
            ts.factory.createArrowFunction(
              undefined, undefined,
              [ts.factory.createParameterDeclaration(
                undefined, undefined, ts.factory.createIdentifier('u'), undefined,
                ts.factory.createTypeReferenceNode('AnyUpdate'), undefined
              )],
              ts.factory.createTypePredicateNode(
                undefined,
                ts.factory.createIdentifier('u'),
                ts.factory.createIndexedAccessTypeNode(
                  ts.factory.createTypeReferenceNode('UpdateKindMap'),
                  ts.factory.createTypeReferenceNode('K')
                )
              ),
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              ts.factory.createBinaryExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createParenthesizedExpression(
                    ts.factory.createAsExpression(
                      ts.factory.createIdentifier('u'),
                      ts.factory.createTypeLiteralNode([
                        ts.factory.createPropertySignature(
                          undefined,
                          ts.factory.createIdentifier('kind'),
                          ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                          ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                        )
                      ])
                    )
                  ),
                  'kind'
                ),
                ts.SyntaxKind.EqualsEqualsEqualsToken,
                ts.factory.createIdentifier('k')
              )
            ),
            ts.factory.createObjectLiteralExpression([
              ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier('kinds'),
                ts.factory.createArrayLiteralExpression(
                  [ts.factory.createIdentifier('k')],
                  false
                )
              )
            ], false)
          ]
        )
      )
    ], true)
  )

  return decl
}

function emitKindShorthand () {
  // export const kind = Object.assign(_kind, { message: _kind('message'), ... })
  const props = UPDATE_KINDS.map((k) => {
    const propName = camelizeKind(k.kindName)

    return ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier(propName),
      ts.factory.createCallExpression(
        ts.factory.createIdentifier('_kind'),
        undefined,
        [ts.factory.createStringLiteral(k.kindName)]
      )
    )
  })

  const decl = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(
        ts.factory.createIdentifier('kind'),
        undefined,
        undefined,
        ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('Object'),
            'assign'
          ),
          undefined,
          [
            ts.factory.createIdentifier('_kind'),
            ts.factory.createObjectLiteralExpression(props, true)
          ]
        )
      )],
      ts.NodeFlags.Const
    )
  )

  return jsDoc('Filter — match a specific update kind. callable form `kind(k)` plus shorthand properties (`kind.message`, `kind.editedMessage`).', decl)
}

function emitActionCallable () {
  // function _action<K extends ServiceActionKind>(k: K): Filter<UpdateKindMap[K]>
  // ServiceActionKind = the subset of UpdateKind whose source is 'derived' (service events)
  const derived = UPDATE_KINDS.filter(k => k.source.kind === 'derived')

  // type ServiceActionKind = 'new_chat_members' | ... — emitted separately
  const typeAlias = ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier('ServiceActionKind'),
    undefined,
    ts.factory.createUnionTypeNode(
      derived.map(k => ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(k.kindName)))
    )
  )

  const fnDecl = ts.factory.createFunctionDeclaration(
    undefined,
    undefined,
    ts.factory.createIdentifier('_action'),
    [ts.factory.createTypeParameterDeclaration(
      undefined,
      ts.factory.createIdentifier('K'),
      ts.factory.createTypeReferenceNode('ServiceActionKind')
    )],
    [ts.factory.createParameterDeclaration(
      undefined, undefined,
      ts.factory.createIdentifier('k'),
      undefined,
      ts.factory.createTypeReferenceNode('K'),
      undefined
    )],
    ts.factory.createTypeReferenceNode('Filter', [
      ts.factory.createIndexedAccessTypeNode(
        ts.factory.createTypeReferenceNode('UpdateKindMap'),
        ts.factory.createTypeReferenceNode('K')
      )
    ]),
    ts.factory.createBlock([
      ts.factory.createReturnStatement(
        ts.factory.createCallExpression(
          ts.factory.createIdentifier('_kind'),
          undefined,
          [ts.factory.createIdentifier('k')]
        )
      )
    ], true)
  )

  return [typeAlias, fnDecl]
}

function emitActionShorthand () {
  // export const action = Object.assign(_action, { newChatMembers: _action('new_chat_members'), ... })
  const derived = UPDATE_KINDS.filter(k => k.source.kind === 'derived')

  const props = derived.map((k) => {
    const propName = camelizeKind(k.kindName)

    return ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier(propName),
      ts.factory.createCallExpression(
        ts.factory.createIdentifier('_action'),
        undefined,
        [ts.factory.createStringLiteral(k.kindName)]
      )
    )
  })

  const decl = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(
        ts.factory.createIdentifier('action'),
        undefined,
        undefined,
        ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('Object'),
            'assign'
          ),
          undefined,
          [
            ts.factory.createIdentifier('_action'),
            ts.factory.createObjectLiteralExpression(props, true)
          ]
        )
      )],
      ts.NodeFlags.Const
    )
  )

  return jsDoc('Filter — match a service-event update kind. shorthand for `kind` restricted to derived (Message-payload) events.', decl)
}
