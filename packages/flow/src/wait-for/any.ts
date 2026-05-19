import type { UpdateKindMap } from '@puregram/api'

import { WaiterAbortedError } from '../errors'

import type { WaiterRegistry } from './registry'
import type { WaitForOptions } from './types'
import { Waiter } from './waiter'

/**
 * one entry in `waitForAny([...])` — a kind plus the per-waiter options that
 * would otherwise be passed to `waitFor(kind, opts)`. each spec races against
 * the others; the first to match wins and the losers are cancelled
 */
export interface WaiterSpec<
  K extends keyof UpdateKindMap = keyof UpdateKindMap,
  T = UpdateKindMap[K]
> {
  kind: K
  options?: WaitForOptions<K, T>
}

// erased shape for the `waitForAny` constraint so the array can hold heterogeneous
// kinds without ts widening K to the full union
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional erasure across update kinds
export type AnyWaiterSpec = WaiterSpec<any, any>

/**
 * type-friendly builder for `waitForAny` entries — preserves the literal `kind`
 * so the `options.filter` parameter is typed precisely as `UpdateKindMap[K]`
 * instead of the wide union. usage:
 *
 *   tg.flow.waitForAny([
 *     spec('callback_query', { filter: (q) => q.data === 'yes' }),
 *     spec('message', { filter: (m) => m.text === 'no' })
 *   ])
 */
export function spec<K extends keyof UpdateKindMap, T = UpdateKindMap[K]> (
  kind: K,
  options?: WaitForOptions<K, T>
) {
  const result: WaiterSpec<K, T> = options !== undefined ? { kind, options } : { kind }

  return result
}

export interface WaitForAnyOptions {
  /** shared abort signal — rejects every pending waiter with `WaiterAbortedError` */
  signal?: AbortSignal
}

/**
 * result of `waitForAny([...])` — `index` is the position of the winning spec
 * in the input array, `value` is the matched (and optionally transformed) update
 */
export interface WaitForAnyResult<T = unknown> {
  index: number
  value: T
}

export type WaitForAnyValueOf<S> = S extends WaiterSpec<infer K, infer T>
  ? (T extends UpdateKindMap[K] ? T : T)
  : never

/**
 * race a list of waiter specs; the first to match resolves the returned promise
 * with `{ index, value }` and the losers are cancelled (their listeners removed).
 *
 * each spec's own `signal` is honored; the top-level `signal` cancels every
 * waiter at once
 */
export function createWaitForAny (registry: WaiterRegistry) {
  return async function waitForAny<S extends readonly AnyWaiterSpec[]> (
    specs: S,
    options: WaitForAnyOptions = {}
  ) {
    if (specs.length === 0) {
      throw new TypeError('waitForAny: specs must not be empty')
    }

    // bail before registration so an already-aborted signal leaves the registry untouched
    if (options.signal?.aborted === true) {
      throw new WaiterAbortedError('any', options.signal.reason)
    }

    const waiters: Waiter<keyof UpdateKindMap>[] = []

    for (const entry of specs) {
      const kind = entry.kind as keyof UpdateKindMap
      const opts = (entry.options ?? {}) as WaitForOptions<keyof UpdateKindMap>
      const waiter = new Waiter<keyof UpdateKindMap>(kind, opts)

      registry.register(waiter)
      waiters.push(waiter)
    }

    let topSignalAbort: (() => void) | undefined

    if (options.signal !== undefined) {
      const signal = options.signal

      topSignalAbort = () => {
        for (const waiter of waiters) {
          waiter.cancel()
        }
      }

      signal.addEventListener('abort', topSignalAbort, { once: true })
    }

    // swallow loser rejections (we cancel them on purpose) so node doesn't surface
    // unhandled rejection warnings — original `waiter.promise` still observable
    const racers = waiters.map((waiter, index) =>
      waiter.promise.then(
        value => ({ kind: 'win' as const, index, value }),
        (reason: unknown) => ({ kind: 'fail' as const, index, reason })
      )
    )

    try {
      const first = await Promise.race(racers)

      if (first.kind === 'fail') {
        // one waiter failed before any won — cancel the rest and rethrow verbatim
        for (let i = 0; i < waiters.length; i++) {
          if (i !== first.index) {
            waiters[i]?.cancel()
          }
        }

        throw first.reason
      }

      for (let i = 0; i < waiters.length; i++) {
        if (i !== first.index) {
          waiters[i]?.cancel()
        }
      }

      return {
        index: first.index,
        value: first.value
      } as WaitForAnyResult<WaitForAnyValueOf<S[number]>>
    } finally {
      if (options.signal !== undefined && topSignalAbort !== undefined) {
        options.signal.removeEventListener('abort', topSignalAbort)
      }
    }
  }
}
