import type { KVStorage } from '@puregram/storage'

import type { RateLimitEntry, RateLimitOutcome } from './types'

const ALLOWED: RateLimitOutcome = { allowed: true }

/**
 * fixed-window hit — start a new window if absent/expired, increment if under budget,
 * return retry-after at the cap. `now` is injected so callers can test deterministically.
 *
 * the get/set pair is not atomic: concurrent hits on one key read the same count and both
 * write `n + 1`, so contention **under**-counts and lets extra traffic through. harmless
 * against `MemoryStorage` behind a single dispatch loop, wide open across processes sharing
 * a redis — `KVStorage` has no compare-and-set to close it with
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
