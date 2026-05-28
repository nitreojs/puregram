import type { Schema, SchemaField, SchemaMethod } from '../schema-types'

import { buildUpdateKinds, type ShortcutAnchor, type UpdateKindSpec } from './updates-config'

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
}

export interface ShortcutAnalysis {
  byKind: Record<string, BoundShortcut[]>
}

// sendMessage → reply, sendPhoto → replyWithPhoto, sendVideoNote → replyWithVideoNote
function replyVerbFor (method: string) {
  return method === 'sendMessage' ? 'reply' : `replyWith${method.slice('send'.length)}`
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
      const bound = bindMethod(kind, method)

      if (!bound) {
        continue
      }

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

  return result
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
