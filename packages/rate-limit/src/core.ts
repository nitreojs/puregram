import type { KVStorage } from '@puregram/storage'

import type { RateLimitEntry, RateLimitOutcome } from './types'

// last-write-wins under contention — worst case is a slight over-count, fails safer for spam prevention.
// `now` is injected for deterministic tests
const ALLOWED: RateLimitOutcome = { allowed: true }

/**
 * fixed-window hit — start a new window if absent/expired, increment if under budget,
 * return retry-after at the cap
 */

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
