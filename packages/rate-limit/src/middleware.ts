import type { Middleware, Telegram } from 'puregram'

import type { AnyUpdate, RateLimitCheckOptions } from './types'

interface TgWithRateLimit {
  rateLimit: {
    resolveKey: (update: unknown, bucket?: string) => string | undefined
    hit: (key: string, limit: number, window: number) => Promise<number | null>
    onLimitExceeded: ((update: unknown, retryAfter: number) => void | Promise<void>) | undefined
  }
}

/**
 * build an `onUpdate` middleware that gates downstream handlers on a per-user
 * budget. on block, the middleware returns without calling `next()` — the
 * update is silently swallowed and downstream middleware/handlers do not run.
 * the per-call (or plugin-level) `onLimitExceeded` callback fires for side-effects
 *
 * pair with `when(filter, …)` from `puregram/filters` to scope the gate to a
 * subset of updates (e.g. `when(kind.message, rateLimitMiddleware(tg, …))`).
 * unkeyable updates are passed through, never blocked
 *
 * @param tg the telegram client extended with `rateLimit()`. the middleware
 *   reads `tg.rateLimit.{resolveKey, hit}` at call time
 */
export function rateLimitMiddleware (tg: Telegram, opts: RateLimitCheckOptions) {
  const target = tg as unknown as TgWithRateLimit

  const middleware: Middleware<AnyUpdate> = async (update, next) => {
    const key = target.rateLimit.resolveKey(update, opts.bucket)

    if (key === undefined) {
      await next()

      return
    }

    const retryAfter = await target.rateLimit.hit(key, opts.limit, opts.window)

    if (retryAfter === null) {
      await next()

      return
    }

    const onLimitExceeded = opts.onLimitExceeded ?? target.rateLimit.onLimitExceeded

    if (onLimitExceeded !== undefined) {
      await onLimitExceeded(update, retryAfter)
    }
  }

  return middleware
}
