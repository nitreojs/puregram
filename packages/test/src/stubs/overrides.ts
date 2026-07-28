import type { ApiErrorSentinel } from './api-error'
import { isApiErrorSentinel } from './api-error'

export interface OverrideOptions {
  times?: number
  mutateWorld?: boolean
}

export type OverrideEntry = unknown

export type ResolveResult =
  | { kind: 'fall-through' }
  | { kind: 'reply', value: unknown, mutateWorld: boolean }
  | { kind: 'error', value: ApiErrorSentinel }

interface InternalEntry {
  entries: OverrideEntry[]
  cursor: number
  remaining: number
  mutateWorld: boolean
}

export class OverrideRegistry {
  private readonly map = new Map<string, InternalEntry>()

  has (method: string) {
    return this.map.has(method)
  }

  set (method: string, entry: OverrideEntry, opts: OverrideOptions = {}) {
    const entries = Array.isArray(entry) ? (entry as OverrideEntry[]) : [entry]

    this.map.set(method, {
      entries,
      cursor: 0,
      remaining: opts.times ?? -1,
      mutateWorld: opts.mutateWorld ?? true
    })
  }

  clear (method?: string) {
    if (method === undefined) {
      this.map.clear()

      return
    }

    this.map.delete(method)
  }

  // eslint-disable-next-line local-rules/no-redundant-return-type -- discriminant unions need explicit kind to narrow
  async resolve (method: string, params: Record<string, unknown>): Promise<ResolveResult> {
    const entry = this.map.get(method)

    if (!entry) {
      return { kind: 'fall-through' }
    }

    if (entry.remaining === 0 || entry.cursor >= entry.entries.length) {
      return { kind: 'fall-through' }
    }

    const slot = entry.entries[entry.cursor]

    if (entry.entries.length > 1) {
      entry.cursor += 1
    }

    if (entry.remaining > 0) {
      entry.remaining -= 1
    }

    let value: unknown

    if (typeof slot === 'function') {
      value = await (slot as (p: Record<string, unknown>) => unknown)(params)
    } else {
      value = slot
    }

    if (value === undefined) {
      return { kind: 'fall-through' }
    }

    if (isApiErrorSentinel(value)) {
      return { kind: 'error', value }
    }

    return { kind: 'reply', value, mutateWorld: entry.mutateWorld }
  }
}
