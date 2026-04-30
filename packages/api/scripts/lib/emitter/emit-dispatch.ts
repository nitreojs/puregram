import ts from 'typescript'

import type { Schema } from '../schema-types'

import { filterAliasName } from './emit-filter-types'
import { formatModule } from './format'
import { versionString } from './load-schema'
import { importTypeNamed, jsDoc } from './ts-factory'
import { UPDATE_KINDS } from './updates-config'

// emits the `TelegramDispatchers` interface — one `on<KindCamel>` method per
// `UpdateKind`, with two overloads each: bare `(handler)` and `(filter, handler)`.
// merged into the `Telegram` class via `interface Telegram extends TelegramDispatchers`,
// installed at runtime by `installDispatchers(tg)` walking `UPDATE_KINDS`
export function emitDispatch (schema: Schema) {
  const members: ts.TypeElement[] = []

  for (const k of UPDATE_KINDS) {
    const dispatcherName = dispatcherMethodName(k.kindName)
    const filterAlias = filterAliasName(k.className)

    members.push(jsDoc(
      `register a handler for every \`${k.kindName}\` update`,
      buildHandlerOnlySignature(dispatcherName, k.className)
    ))

    members.push(jsDoc(
      `register a filter-gated handler for \`${k.kindName}\` updates. handler arg narrows via \`Modify<${k.className}, Mod>\``,
      buildFilterAndHandlerSignature(dispatcherName, k.className, filterAlias)
    ))
  }

  const dispatchersInterface = ts.factory.createInterfaceDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier('TelegramDispatchers'),
    undefined,
    undefined,
    members
  )

  const imports = [
    importTypeNamed(['Filter'], '../filter-runtime'),
    importTypeNamed(['Modify'], '../util-types'),
    importTypeNamed(['OnOptions', 'UpdateHandler'], '../dispatch-runtime'),
    importTypeNamed(UPDATE_KINDS.map(k => k.className).sort(), './updates')
  ]

  return formatModule({
    nodes: [dispatchersInterface],
    imports,
    botApiVersion: versionString(schema),
    sourceUrl: schema.source.corefork,
    generatedAt: schema.source.fetchedAt
  })
}

// `message` → `onMessage`, `chat_member` → `onChatMember`,
// `proximity_alert_triggered` → `onProximityAlertTriggered`. service-event kinds
// follow the same pattern — no special-cased aliases are emitted; the optional
// dispatcher-alias map (post-emit, in puregram core) layers shorter names on top
function dispatcherMethodName (kindName: string) {
  const camel = kindName.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join('')

  return `on${camel}`
}

// `onMessage(handler, options?): this`
function buildHandlerOnlySignature (methodName: string, className: string) {
  return ts.factory.createMethodSignature(
    undefined,
    ts.factory.createIdentifier(methodName),
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined, undefined,
        ts.factory.createIdentifier('handler'),
        undefined,
        ts.factory.createTypeReferenceNode('UpdateHandler', [
          ts.factory.createTypeReferenceNode(className)
        ]),
        undefined
      ),
      ts.factory.createParameterDeclaration(
        undefined, undefined,
        ts.factory.createIdentifier('options'),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        ts.factory.createTypeReferenceNode('OnOptions'),
        undefined
      )
    ],
    ts.factory.createThisTypeNode()
  )
}

// `onMessage<Mod>(filter, handler, options?): this`
// filter is pinned to `Filter<unknown, Mod>` — only `Mod` is inferred. kind-bound
// filters like `kind.message` (Base=MessageUpdate) remain assignable here because
// `Filter<X, M>` is covariant on its Base parameter (the type-guard return narrows
// strictly, so a stricter guard satisfies a wider parameter slot). dropping the
// Base generic cuts one type parameter per call × 53 dispatcher methods, which
// the LSP picks up most when resolving overloads on every keystroke
function buildFilterAndHandlerSignature (methodName: string, className: string, _filterAlias: string) {
  return ts.factory.createMethodSignature(
    undefined,
    ts.factory.createIdentifier(methodName),
    undefined,
    [
      ts.factory.createTypeParameterDeclaration(undefined, ts.factory.createIdentifier('Mod'), undefined, undefined)
    ],
    [
      ts.factory.createParameterDeclaration(
        undefined, undefined,
        ts.factory.createIdentifier('filter'),
        undefined,
        ts.factory.createTypeReferenceNode('Filter', [
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ts.factory.createTypeReferenceNode('Mod')
        ]),
        undefined
      ),
      ts.factory.createParameterDeclaration(
        undefined, undefined,
        ts.factory.createIdentifier('handler'),
        undefined,
        ts.factory.createTypeReferenceNode('UpdateHandler', [
          ts.factory.createTypeReferenceNode('Modify', [
            ts.factory.createTypeReferenceNode(className),
            ts.factory.createTypeReferenceNode('Mod')
          ])
        ]),
        undefined
      ),
      ts.factory.createParameterDeclaration(
        undefined, undefined,
        ts.factory.createIdentifier('options'),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        ts.factory.createTypeReferenceNode('OnOptions'),
        undefined
      )
    ],
    ts.factory.createThisTypeNode()
  )
}

export { dispatcherMethodName }
