// @puregram/rate-limit — per-user fixed-window rate limiting plugin

export { rateLimit, type RateLimitExtension } from './plugin'
export type {
  AnyUpdate,
  RateLimitCallback,
  RateLimitCheckOptions,
  RateLimitEntry,
  RateLimitOptions,
  RateLimitOutcome
} from './types'

// re-exported from @puregram/storage so users can `import { MemoryStorage } from '@puregram/rate-limit'`
// without pulling in the storage package directly. canonical import path is still '@puregram/storage'
export { MemoryStorage, LruMemoryStorage } from '@puregram/storage'
export type { KVStorage, LruMemoryStorageOptions } from '@puregram/storage'
