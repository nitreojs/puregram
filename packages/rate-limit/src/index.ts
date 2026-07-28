export { DEFAULT_MAX_ENTRIES, rateLimit, type RateLimitExtension } from './plugin'
export { rateLimitFilter } from './filter'
export { rateLimitMiddleware } from './middleware'
export type {
  AnyUpdate,
  RateLimitCallback,
  RateLimitCheckOptions,
  RateLimitEntry,
  RateLimitOptions,
  RateLimitOutcome
} from './types'

// re-export from @puregram/storage so consumers don't have to pull it in directly
export { MemoryStorage, LruMemoryStorage } from '@puregram/storage'
export type { KVStorage, LruMemoryStorageOptions } from '@puregram/storage'
