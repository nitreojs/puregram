import type { Update } from '@puregram/api'

import type { CustomUpdate } from './custom-updates'

// handlers compose middleware-style. each handler receives the update and a `next`
// thunk; calling `next()` lets the next registered handler run, returning without
// calling `next()` halts the chain. that lets command-style handlers terminate
// after matching, and lets cross-cutting handlers (logging, metrics) explicitly
// pass through. order of registration is the order of execution
export type UpdateHandler<U = unknown> = (
  update: U,
  next: () => Promise<void>
) => unknown

/**
 * dispatch-side union of every update an incoming `tg.on(...)` handler can see —
 * bot-api wrapped updates from `@puregram/api` plus any user-defined `CustomUpdate`
 */
export type AnyUpdate = Update | CustomUpdate

/**
 * predicate signature accepted by the `tg.on(predicate, handler, options?)` form.
 * the type-guard variant narrows the handler arg automatically; the plain-boolean
 * variant keeps it as `AnyUpdate`. predicates may also return `Promise<boolean>` —
 * the dispatcher awaits the result before deciding whether to invoke the handler
 */
export type UpdatePredicate<T extends AnyUpdate = AnyUpdate> =
  | ((update: AnyUpdate) => update is T)
  | ((update: AnyUpdate) => boolean)
  | ((update: AnyUpdate) => Promise<boolean>)

export type Priority = 'high' | 'normal' | 'low'

export interface OnOptions {
  priority?: Priority
}

const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  normal: 1,
  low: 2
}

interface KindEntry {
  type: 'kind'
  kind: string
  handler: UpdateHandler
  priority: Priority
  seq: number
}

interface PredicateEntry {
  type: 'predicate'
  predicate: (update: AnyUpdate) => boolean | Promise<boolean>
  handler: UpdateHandler
  priority: Priority
  seq: number
}

export type DispatchEntry = KindEntry | PredicateEntry

export type DispatchEntryInput =
  | Omit<KindEntry, 'seq'>
  | Omit<PredicateEntry, 'seq'>

export class Dispatcher {
  private readonly entries: DispatchEntry[] = []
  private nextSeq = 0

  add (entry: DispatchEntryInput) {
    const seq = this.nextSeq++

    this.entries.push({ ...entry, seq } as DispatchEntry)
  }

  on (kind: string, handler: UpdateHandler, priority: Priority = 'normal') {
    this.add({ type: 'kind', kind, handler, priority })
  }

  off (kind: string, handler: UpdateHandler) {
    const idx = this.entries.findIndex(
      e => e.type === 'kind' && e.kind === kind && e.handler === handler
    )

    if (idx >= 0) {
      this.entries.splice(idx, 1)
    }
  }

  async runUserHandlers (update: AnyUpdate) {
    if (this.entries.length === 0) {
      return
    }

    // snapshot so registration changes during dispatch don't shift the cursor
    const snapshot = this.entries.slice()
    const matched: DispatchEntry[] = []

    for (const entry of snapshot) {
      if (entry.type === 'kind') {
        if (entry.kind === update.kind) {
          matched.push(entry)
        }

        continue
      }

      // kinds-metadata fast-path — filters built via `defineFilter` carry an optional
      // `kinds` hint listing the update kinds they can possibly match. when present,
      // skip predicate eval entirely for incompatible kinds. bare predicates without
      // metadata fall through and are always evaluated
      const hint = (entry.predicate as { kinds?: readonly string[] }).kinds

      if (hint !== undefined && !hint.includes(update.kind)) {
        continue
      }

      // sync predicates stay on the hot path; only filters that return a thenable
      // pay the await cost. lets `tg.on((u) => boolean, …)` keep zero-overhead
      // dispatch while still supporting `defineAsyncFilter` and userland async predicates
      const result = entry.predicate(update)

      if (typeof result === 'object' && result !== null && 'then' in result) {
        if (await result) {
          matched.push(entry)
        }
      } else if (result) {
        matched.push(entry)
      }
    }

    if (matched.length === 0) {
      return
    }

    matched.sort((a, b) => {
      const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]

      if (rank !== 0) {
        return rank
      }

      return a.seq - b.seq
    })

    let i = 0

    const next = async (): Promise<void> => {
      if (i >= matched.length) {
        return
      }

      const entry = matched[i++]

      if (entry === undefined) {
        return
      }

      await entry.handler(update, next)
    }

    await next()
  }

  has (kind: string) {
    return this.entries.some(e => e.type === 'kind' && e.kind === kind)
  }
}
