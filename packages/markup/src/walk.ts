/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Formatted } from './formatted'

export interface FormattableSlot {
  readonly path: readonly string[]
  readonly textKey: string
  readonly entitiesKey: string
}

export type FormattableFields = Readonly<Record<string, readonly FormattableSlot[]>>

interface RawFormattable {
  text: string
  entities?: readonly { type: string, offset: number, length: number }[]
}

function isFormattableShape (value: unknown) {
  return typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    typeof (value as { text: unknown }).text === 'string'
}

function applyAtLeaf (parent: Record<string, unknown>, slot: FormattableSlot) {
  const value = parent[slot.textKey]

  if (value instanceof Formatted) {
    parent[slot.textKey] = value.text
    parent[slot.entitiesKey] = [...value.entities]

    return
  }

  if (typeof value === 'string') {
    return
  }

  if (isFormattableShape(value)) {
    const f = Formatted.from(value as RawFormattable)

    parent[slot.textKey] = f.text
    parent[slot.entitiesKey] = [...f.entities]
  }
}

function walkPath (root: unknown, path: readonly string[], slot: FormattableSlot): void {
  if (path.length === 1) {
    if (typeof root === 'object' && root !== null) {
      applyAtLeaf(root as Record<string, unknown>, slot)
    }

    return
  }

  const head = path[0]!
  const tail = path.slice(1)

  if (head === '*') {
    if (Array.isArray(root)) {
      for (const item of root) {
        walkPath(item, tail, slot)
      }
    }

    return
  }

  if (typeof root === 'object' && root !== null) {
    walkPath((root as Record<string, unknown>)[head], tail, slot)
  }
}

/**
 * mutates `params` in place, replacing every `Formatted` (or `{ text, entities }` shape) at
 * a known formattable slot with its plain text + sibling entities array.
 * descriptor comes from `@puregram/api`'s codegenned `FORMATTABLE_FIELDS`
 */
export function unwrapFormatted (
  method: string,
  params: Record<string, unknown> | undefined,
  fields: FormattableFields
) {
  if (params === undefined) {
    return
  }

  const slots = fields[method]

  if (slots === undefined) {
    return
  }

  for (const slot of slots) {
    walkPath(params, slot.path, slot)
  }
}
