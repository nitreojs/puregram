import type { Schema, SchemaField, SchemaMethod } from '../schema-types'

import { buildUpdateKinds, shortcutNameFor, replyVerbForSendName, SHORTCUT_ALIASES, BUSINESS_ANCHOR, THREAD_ANCHOR, type ShortcutAnchor, type UpdateKindSpec } from './updates-config'

export interface ReplyBinding {
  verb: string
  messageId: ShortcutAnchor
}

export interface BoundShortcut {
  method: string
  filledArgs: ShortcutAnchor[]
  userArgs: SchemaField[]
  // present on the reply twin of a send* shortcut — fills `reply_parameters.message_id`
  reply?: ReplyBinding
  // forces the emitted name, bypassing the canonical rename — used for alias twins
  verbOverride?: string
}

export interface ShortcutAnalysis {
  byKind: Record<string, BoundShortcut[]>
}

function replyVerbFor (method: string) {
  return replyVerbForSendName(shortcutNameFor(method))
}

// for every shortcut whose method has an alias, append a clone that emits under the short name
function expandAliases (result: ShortcutAnalysis) {
  for (const list of Object.values(result.byKind)) {
    const aliases: BoundShortcut[] = []

    for (const sc of list) {
      const base = SHORTCUT_ALIASES[sc.method]

      if (base !== undefined) {
        aliases.push({ ...sc, verbOverride: sc.reply ? replyVerbForSendName(base) : base })
      }
    }

    list.push(...aliases)
  }
}

export function analyzeShortcuts (schema: Schema, kinds: UpdateKindSpec[] = buildUpdateKinds(schema)) {
  const result: ShortcutAnalysis = { byKind: {} }

  for (const kind of kinds) {
    result.byKind[kind.kindName] = []

    if (kind.anchors.length === 0) {
      continue
    }

    const messageId = kind.anchors.find(a => a.schemaArg === 'message_id')

    for (const method of schema.methods) {
      const raw = bindMethod(kind, method)

      if (!raw) {
        continue
      }

      const bound = augmentBusiness(raw, kind, schema)

      result.byKind[kind.kindName]!.push(bound)

      // a reply is the same send* call plus a `reply_parameters.message_id` fill — emit a
      // twin shortcut for every send* method that accepts reply_parameters on kinds that
      // carry a message to reply to
      if (messageId && method.name.startsWith('send') && method.arguments.some(a => a.name === 'reply_parameters')) {
        result.byKind[kind.kindName]!.push({
          ...bound,
          reply: { verb: replyVerbFor(method.name), messageId }
        })
      }
    }
  }

  expandAliases(result)

  return result
}

function augmentBusiness (bound: BoundShortcut, kind: UpdateKindSpec, schema: Schema) {
  const arg = bound.userArgs.find(a => a.name === 'business_connection_id')

  if (!arg || !payloadHasField(kind, schema, 'business_connection_id')) {
    return bound
  }

  const anchor = arg.required
    ? { ...BUSINESS_ANCHOR, optional: false, nonNull: true }
    : BUSINESS_ANCHOR

  return {
    ...bound,
    filledArgs: [...bound.filledArgs, anchor],
    userArgs: bound.userArgs.filter(a => a.name !== 'business_connection_id')
  }
}

function bindMethod (kind: UpdateKindSpec, method: SchemaMethod) {
  const filledArgs: ShortcutAnchor[] = []
  const userArgs: SchemaField[] = []

  for (const arg of method.arguments) {
    const anchor = kind.anchors.find(a => a.schemaArg === arg.name)

    if (anchor) {
      filledArgs.push(anchor)
    } else {
      userArgs.push(arg)
    }
  }

  if (filledArgs.length === 0) {
    return null
  }

  return { method: method.name, filledArgs, userArgs }
}

// thread-scoped twin of analyzeShortcuts. same binding, but every method additionally fills
// message_thread_id from the update. only methods that actually accept a message_thread_id arg
// are included (send*, copy*/forward*, forum-topic management), and only for kinds whose payload
// carries the field — so the emitted companion never references a non-existent raw.message_thread_id
export function analyzeThreadShortcuts (schema: Schema, kinds: UpdateKindSpec[] = buildUpdateKinds(schema)) {
  const result: ShortcutAnalysis = { byKind: {} }

  for (const kind of kinds) {
    result.byKind[kind.kindName] = []

    if (kind.anchors.length === 0 || !payloadHasField(kind, schema, 'message_thread_id')) {
      continue
    }

    const anchors = [...kind.anchors, THREAD_ANCHOR]
    const messageId = anchors.find(a => a.schemaArg === 'message_id')

    for (const method of schema.methods) {
      if (!method.arguments.some(a => a.name === 'message_thread_id')) {
        continue
      }

      const raw = bindMethod({ ...kind, anchors }, method)

      if (!raw) {
        continue
      }

      const bound = augmentBusiness(raw, kind, schema)

      result.byKind[kind.kindName]!.push(bound)

      if (messageId && method.name.startsWith('send') && method.arguments.some(a => a.name === 'reply_parameters')) {
        result.byKind[kind.kindName]!.push({
          ...bound,
          reply: { verb: replyVerbFor(method.name), messageId }
        })
      }
    }
  }

  expandAliases(result)

  return result
}

function payloadHasField (kind: UpdateKindSpec, schema: Schema, field: string) {
  const obj = schema.objects.find(o => o.name === kind.payloadType.replace(/^Telegram/, ''))

  return obj?.kind === 'object' && obj.fields.some(f => f.name === field)
}
