import type { Schema, SchemaField, SchemaMethod } from '../schema-types'

import { UPDATE_KINDS, type ShortcutAnchor, type UpdateKindSpec } from './updates-config'

export interface BoundShortcut {
  method: string
  filledArgs: ShortcutAnchor[]
  userArgs: SchemaField[]
}

export interface ShortcutAnalysis {
  byKind: Record<string, BoundShortcut[]>
}

export function analyzeShortcuts (schema: Schema) {
  const result: ShortcutAnalysis = { byKind: {} }

  for (const kind of UPDATE_KINDS) {
    result.byKind[kind.kindName] = []

    if (kind.anchors.length === 0) {
      continue
    }

    for (const method of schema.methods) {
      const bound = bindMethod(kind, method)

      if (bound) {
        result.byKind[kind.kindName].push(bound)
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
