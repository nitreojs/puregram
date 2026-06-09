import { verbFor } from '../emitter/emit-updates'
import type { BoundShortcut } from '../emitter/shortcut-analyzer'
import { analyzeShortcuts } from '../emitter/shortcut-analyzer'
import type { UpdateExtra, UpdateKindSpec } from '../emitter/updates-config'
import { buildUpdateKinds } from '../emitter/updates-config'
import type { Schema } from '../schema-types'

import { cell, codeCell, GENERATED_BANNER } from './shared'

const objectAnchor = (payloadType: string) => `/api/objects#${payloadType.replace(/^Telegram/, '').toLowerCase()}`
const methodAnchor = (method: string) => `/api/methods#${method.toLowerCase()}`

function baseName (className: string) {
  return className.replace(/Update$/, '')
}

function renderShortcuts (shortcuts: BoundShortcut[]) {
  if (shortcuts.length === 0) {
    return ['_no per-kind shortcuts — call any method via `update.api.X(...)`_', '']
  }

  const links = shortcuts.map(sc => `[\`${verbFor(sc)}\`](${methodAnchor(sc.method)})`)

  return ['**shortcuts**', '', links.join(' · '), '']
}

function renderHelpers (extras: UpdateExtra[]) {
  if (extras.length === 0) {
    return []
  }

  const lines = ['**helpers**', '', '| member | kind | description |', '| --- | :---: | --- |']

  for (const extra of extras) {
    const signature = extra.kind === 'method'
      ? `${extra.name}(${extra.params ?? ''})`
      : extra.name

    lines.push(`| \`${codeCell(signature)}\` | ${extra.kind} | ${cell(extra.jsdoc ?? '')} |`)
  }

  lines.push('')

  return lines
}

function renderKind (kind: UpdateKindSpec, shortcuts: BoundShortcut[]) {
  const base = baseName(kind.className)

  const lines: string[] = [
    `## ${kind.kindName}`,
    '',
    `class \`${kind.className}\` · handler \`tg.on${base}\` · filter \`${base}Filter\``,
    ''
  ]

  if (kind.source.kind === 'derived') {
    lines.push(`service event — derived from a [${kind.payloadType.replace(/^Telegram/, '')}](${objectAnchor(kind.payloadType)}) payload when \`raw.${kind.source.messageField}\` is set`, '')
  } else {
    lines.push(`payload [${kind.payloadType.replace(/^Telegram/, '')}](${objectAnchor(kind.payloadType)}) — available as \`update.raw\`; every payload field is also exposed as a camelCase getter`, '')
  }

  lines.push(...renderShortcuts(shortcuts))
  lines.push(...renderHelpers(kind.extras ?? []))

  return lines.join('\n')
}

function renderIndexTable (kinds: UpdateKindSpec[]) {
  const lines = ['| kind | class | handler | payload |', '| --- | --- | --- | --- |']

  for (const kind of kinds) {
    const base = baseName(kind.className)
    const payload = kind.payloadType.replace(/^Telegram/, '')

    lines.push(`| [\`${kind.kindName}\`](#${kind.kindName.replace(/_/g, '-')}) | \`${kind.className}\` | \`tg.on${base}\` | [${payload}](${objectAnchor(kind.payloadType)}) |`)
  }

  lines.push('')

  return lines.join('\n')
}

export function emitUpdatesPage (schema: Schema) {
  const kinds = buildUpdateKinds(schema)
  const analysis = analyzeShortcuts(schema, kinds)

  const head = [
    GENERATED_BANNER,
    '',
    '# updates',
    '',
    `every update kind puregram wraps (bot api ${schema.version.major}.${schema.version.minor}). each is a dedicated class with a \`kind\` discriminant, the raw bot-api payload on \`update.raw\`, per-kind shortcuts, and ergonomic helpers. register handlers with the matching \`tg.on<Kind>\` — see [dispatch & filters](/guide/handling-updates/dispatch-and-filters)`,
    ''
  ]

  const body = kinds.map(kind => renderKind(kind, analysis.byKind[kind.kindName] ?? [])).join('\n')

  return `${head.join('\n')}\n${renderIndexTable(kinds)}\n${body}\n`
}
