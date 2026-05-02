import { type KVStorage, MemoryStorage } from '@puregram/storage'
import { createPlugin, type Telegram } from 'puregram'

import { hit as coreHit, reset as coreReset } from './core'
import { composeKey, defaultGetKey } from './key'
import type {
  AnyUpdate, RateLimitCallback, RateLimitCheckOptions, RateLimitEntry, RateLimitOptions, RateLimitOutcome
} from './types'

/**
 * the `tg.rateLimit` extension. `check` resolves the user key from an update and
 * applies a per-call gate; `hit` is the raw bucket primitive for custom keys (e.g.
 * a global "all api requests" counter). all return `null` when allowed and the
 * retry-after seconds when blocked
 */
export interface RateLimitExtension {
  /**
   * gate an update against a per-call budget. returns `null` when allowed,
   * retry-after seconds when blocked. does not invoke `onLimitExceeded` —
   * imperative callers handle the response themselves
   */
  check: (update: AnyUpdate, opts: RateLimitCheckOptions) => Promise<number | null>
  /** raw bucket access for custom keys outside the per-user model */
  hit: (key: string, limit: number, window: number) => Promise<number | null>
  /** drop the bucket for `key` */
  reset: (key: string) => Promise<void>
  /** the configured `KVStorage<RateLimitEntry>` instance */
  storage: KVStorage<RateLimitEntry>
  /**
   * resolve the per-update storage key — the same value `check` would use.
   * exposed for filter/middleware shims that need to gate on the same key
   * without rebuilding it
   */
  resolveKey: (update: AnyUpdate, bucket?: string) => string | undefined
  /** plugin-level fallback callback. filter/middleware shims call it on block */
  onLimitExceeded: RateLimitCallback | undefined
}

const toRetryAfter = (outcome: RateLimitOutcome) =>
  outcome.allowed ? null : outcome.retryAfter

/**
 * per-user fixed-window rate limiting plugin. install attaches `tg.rateLimit`
 * but registers no global middleware — gating is opt-in via the filter or
 * middleware shims (see `./filter`, `./middleware`) or the imperative
 * `tg.rateLimit.check(update, opts)` form
 */
export function rateLimit (options: RateLimitOptions = {}) {
  const storage: KVStorage<RateLimitEntry> = options.storage ?? new MemoryStorage<RateLimitEntry>()
  const getKey = options.getKey ?? defaultGetKey
  const onLimitExceeded = options.onLimitExceeded

  return createPlugin({
    name: 'rateLimit',
    install: (_tg: Telegram) => {
      const hit = async (key: string, limit: number, window: number) =>
        toRetryAfter(await coreHit(storage, key, limit, window, Date.now()))

      const ext: RateLimitExtension = {
        check: async (update, opts) => {
          const userKey = getKey(update)

          if (userKey === undefined) {
            return null
          }

          return hit(composeKey(userKey, opts.bucket), opts.limit, opts.window)
        },
        hit,
        reset: (key: string) => coreReset(storage, key),
        storage,
        resolveKey: (update, bucket) => {
          const userKey = getKey(update)

          return userKey === undefined ? undefined : composeKey(userKey, bucket)
        },
        onLimitExceeded
      }

      return ext
    }
  })
}
