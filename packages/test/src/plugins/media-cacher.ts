import type { Telegram } from 'puregram'

import type { TestEnv } from '../env'

import { registerPack } from './registry'

interface MediaCacheHandle {
  /** snapshot of the cache as a sync map of `cacheKey -> file_id` */
  entries: () => Map<string, string>
  /** pre-populate the cache with `(cacheKey, file_id)`, mirrored into runtime storage */
  seed: (key: string, fileId: string) => void
  /** drop every cached entry, both in the mirror and in runtime storage */
  clear: () => void
  /** count of cache hits observed since env creation */
  readonly hits: number
  /** count of cache misses observed since env creation */
  readonly misses: number
}

declare module '../env' {
  interface TestEnv {
    mediaCache?: MediaCacheHandle
  }
}

interface KvStorageLike {
  get: (key: string) => Promise<string | undefined>
  set: (key: string, value: string) => Promise<void>
  delete: (key: string) => Promise<void>
  has: (key: string) => Promise<boolean>
  keys?: () => AsyncIterable<string>
}

interface MediaCacherRuntime {
  get: (storageKey: string, sourceValue: string) => Promise<string | undefined>
  invalidate: (storageKey: string, sourceValue: string) => Promise<void>
  storage: KvStorageLike
}

// the underlying mediaCacher uses an async KVStorage<string>, but tests want
// a sync surface. mirror every storage write into a local Map and wrap `get`
// to count hit/miss against the cache key. seed/clear write through to both
registerPack({
  pluginName: 'mediaCacher',
  apply (env: TestEnv, tg: Telegram) {
    const runtime = (tg as unknown as { mediaCacher?: MediaCacherRuntime }).mediaCacher

    if (runtime === undefined) {
      return
    }

    const mirror = new Map<string, string>()
    let hits = 0
    let misses = 0

    const storage = runtime.storage
    const originalGet = storage.get.bind(storage)
    const originalSet = storage.set.bind(storage)
    const originalDelete = storage.delete.bind(storage)

    storage.get = async (key) => {
      const value = await originalGet(key)

      if (value === undefined) {
        misses += 1
      } else {
        hits += 1
        mirror.set(key, value)
      }

      return value
    }

    storage.set = async (key, value) => {
      await originalSet(key, value)
      mirror.set(key, value)
    }

    storage.delete = async (key) => {
      await originalDelete(key)
      mirror.delete(key)
    }

    const handle = {
      entries () {
        return new Map(mirror)
      },
      seed (key: string, fileId: string) {
        mirror.set(key, fileId)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- fire-and-forget kv mirror
        originalSet(key, fileId)
      },
      clear () {
        const keys = [...mirror.keys()]

        mirror.clear()

        for (const key of keys) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises -- fire-and-forget kv mirror
          originalDelete(key)
        }
      },
      get hits () {
        return hits
      },
      get misses () {
        return misses
      }
    } as MediaCacheHandle

    ;(env as unknown as { mediaCache: MediaCacheHandle }).mediaCache = handle
  }
})

export {}
