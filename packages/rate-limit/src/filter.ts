import { defineAsyncFilter } from '@puregram/api'
import type { Telegram } from 'puregram'

import type { RateLimitCheckOptions } from './types'

interface TgWithRateLimit {
  rateLimit: {
    resolveKey: (update: unknown, bucket?: string) => string | undefined
    hit: (key: string, limit: number, window: number) => Promise<number | null>
    onLimitExceeded: ((update: unknown, retryAfter: number) => void | Promise<void>) | undefined
  }
}

const formatName = (opts: RateLimitCheckOptions) =>
  `rateLimit(${opts.limit}/${opts.window}s${opts.bucket ? `, bucket=${opts.bucket}` : ''})`

/**
 * build an async filter that gates the rest of the chain on a per-user budget.
 * matches when the request is under budget; on block returns false and invokes
 * `onLimitExceeded` (per-call override > plugin-level callback > silent no-op).
 *
 * **side-effecting filter** — most filters are pure predicates; this one writes
 * to storage and may fire a user callback. compose it last in `and(...)` chains
 * so cheaper structural filters (`command`, `kind.message`) short-circuit first
 * and the dispatcher's `kinds` fast-path can skip the filter entirely on
 * unrelated update kinds
 *
 * unkeyable updates (no from/senderChat/chat) are passed through — never blocked
 *
 * @param tg the telegram client extended with `rateLimit()`. the filter reads
 *   `tg.rateLimit.{resolveKey, hit}` at call time, so the plugin must be installed
 *   before any handler using this filter receives an update
 */
export function rateLimitFilter (tg: Telegram, opts: RateLimitCheckOptions) {
  const target = tg as unknown as TgWithRateLimit

  return defineAsyncFilter(formatName(opts), async (update) => {
    const key = target.rateLimit.resolveKey(update, opts.bucket)

    if (key === undefined) {
      return true
    }

    const retryAfter = await target.rateLimit.hit(key, opts.limit, opts.window)

    if (retryAfter === null) {
      return true
    }

    const onLimitExceeded = opts.onLimitExceeded ?? target.rateLimit.onLimitExceeded

    if (onLimitExceeded !== undefined) {
      await onLimitExceeded(update, retryAfter)
    }

    return false
  })
}
