import type { Telegram } from 'puregram'

import type { TestEnv } from '../env'

import { registerPack } from './registry'

interface RateLimitEntry {
  hits: number
  resetAt: number
}

interface RateLimitUsage {
  hits: number
  resetAt: number
}

interface RateLimitRejection {
  key: string
  reason?: string
  at: number
}

interface RateLimitHandle {
  /** read the current bucket state for a fully-composed key (e.g. `default:42`) */
  usage: (key: string) => RateLimitUsage
  /** clear one bucket when `key` is given, otherwise drop every bucket */
  reset: (key?: string) => Promise<void>
  /** the most recent block recorded by the wrapped `hit` */
  lastRejection: () => RateLimitRejection | undefined
}

declare module '../env' {
  interface TestEnv {
    rateLimit?: RateLimitHandle
  }
}

interface KvStorageLike {
  get: (key: string) => Promise<RateLimitEntry | undefined>
  set: (key: string, value: RateLimitEntry) => Promise<void>
  delete: (key: string) => Promise<void>
  keys?: () => AsyncIterable<string>
}

interface RateLimitRuntime {
  hit: (key: string, limit: number, window: number) => Promise<number | null>
  reset: (key: string) => Promise<void>
  storage: KvStorageLike
}

const EMPTY_USAGE: RateLimitUsage = { hits: 0, resetAt: 0 }

// usage reads sync from a cache mirror updated on every wrapped hit;
// `reset(key?)` hits runtime for one key or drains the storage iterator
registerPack({
  pluginName: 'rateLimit',
  apply (env: TestEnv, tg: Telegram) {
    const runtime = (tg as unknown as { rateLimit?: RateLimitRuntime }).rateLimit

    if (runtime === undefined) {
      return
    }

    const cache = new Map<string, RateLimitEntry>()
    let lastRejection: RateLimitRejection | undefined

    const refresh = async (key: string) => {
      const entry = await runtime.storage.get(key)

      if (entry === undefined) {
        cache.delete(key)
      } else {
        cache.set(key, { hits: entry.hits, resetAt: entry.resetAt })
      }
    }

    const originalHit = runtime.hit.bind(runtime)
    const originalReset = runtime.reset.bind(runtime)

    runtime.hit = async (key, limit, window) => {
      const retryAfter = await originalHit(key, limit, window)

      await refresh(key)

      if (retryAfter !== null) {
        lastRejection = {
          key,
          reason: `over budget (limit=${limit}/${window}s, retryAfter=${retryAfter}s)`,
          at: Date.now()
        }
      }

      return retryAfter
    }

    runtime.reset = async (key) => {
      await originalReset(key)
      cache.delete(key)
    }

    const handle: RateLimitHandle = {
      usage (key) {
        const entry = cache.get(key)

        return entry === undefined ? EMPTY_USAGE : { hits: entry.hits, resetAt: entry.resetAt }
      },

      async reset (key) {
        if (key !== undefined) {
          await originalReset(key)
          cache.delete(key)

          return
        }

        // all-buckets — iterate storage so we nuke entries the cache hasn't seen (e.g. directly seeded)
        const seen = new Set<string>()

        if (typeof runtime.storage.keys === 'function') {
          for await (const k of runtime.storage.keys()) {
            seen.add(k)
          }
        }

        for (const k of cache.keys()) {
          seen.add(k)
        }

        for (const k of seen) {
          await originalReset(k)
        }

        cache.clear()
      },

      lastRejection () {
        return lastRejection
      }
    }

    ;(env as unknown as { rateLimit: RateLimitHandle }).rateLimit = handle
  }
})

export {}
