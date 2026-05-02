import type { AnyUpdate } from '@puregram/api'
import type { KVStorage } from '@puregram/storage'

/** any wrapped update that flows through the dispatcher (bot-api kinds + custom) */
export type { AnyUpdate }

/** fixed-window counter entry. `resetAt` is absolute epoch ms — `now >= resetAt` expires the entry */
export interface RateLimitEntry {
  hits: number
  resetAt: number
}

/** outcome of a rate-limit check. `allowed: false` carries seconds-to-wait before retry */
export type RateLimitOutcome =
  | { allowed: true }
  | { allowed: false, retryAfter: number }

export type RateLimitCallback = (update: AnyUpdate, retryAfter: number) => void | Promise<void>

/** plugin-level options. defaults flow through to per-call options when not overridden */
export interface RateLimitOptions {
  /** backing storage. default: fresh `MemoryStorage<RateLimitEntry>` */
  storage?: KVStorage<RateLimitEntry>
  /** how to derive the per-user key. default: from.id ?? senderChat.id ?? chat.id */
  getKey?: (update: AnyUpdate) => string | undefined
  /** invoked once per blocked update unless overridden per call. default: silent no-op */
  onLimitExceeded?: RateLimitCallback
}

/** per-call options for the filter / middleware / imperative forms */
export interface RateLimitCheckOptions {
  /** maximum hits permitted in the window */
  limit: number
  /** window length in seconds */
  window: number
  /**
   * sub-key appended to the user key — gives one user N independent counters
   * (e.g. one per command). default: `'default'`
   */
  bucket?: string
  /** override the plugin-level callback for this gate */
  onLimitExceeded?: RateLimitCallback
}
