import type { KVStorage } from '@puregram/storage'

import type { RateLimitEntry, RateLimitOutcome } from './types'

/**
 * fixed-window hit. read the entry; if absent or expired, start a new window;
 * otherwise increment if under budget, or report retry-after when at the cap.
 *
 * `now` is injected for deterministic tests. last-write-wins under contention
 * — worst case is a slight over-count, which fails on the safer side for a
 * spam-prevention primitive
 */
const ALLOWED: RateLimitOutcome = { allowed: true }

export async function hit (
  storage: KVStorage<RateLimitEntry>,
  key: string,
  limit: number,
  window: number,
  now: number
) {
  const entry = await storage.get(key)

  if (entry === undefined || now >= entry.resetAt) {
    await storage.set(key, { hits: 1, resetAt: now + window * 1000 })

    return ALLOWED
  }

  if (entry.hits < limit) {
    await storage.set(key, { hits: entry.hits + 1, resetAt: entry.resetAt })

    return ALLOWED
  }

  const blocked: RateLimitOutcome = {
    allowed: false,
    retryAfter: Math.ceil((entry.resetAt - now) / 1000)
  }

  return blocked
}

/** drop the entry for `key`. no-op if absent */
export function reset (storage: KVStorage<RateLimitEntry>, key: string) {
  return storage.delete(key)
}
