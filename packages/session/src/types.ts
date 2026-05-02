import type { UpdateKindMap } from '@puregram/api'
import type { KVStorage } from '@puregram/storage'
import type { CustomUpdate } from 'puregram'

/**
 * user-augmentable session shape. widen the typed surface of `update.session`
 * by declaration-merging fields onto SessionData:
 *
 * @example
 * ```ts
 * declare module '@puregram/session' {
 *   interface SessionData {
 *     counter: number
 *     user: { name: string }
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface -- user-augmentable
export interface SessionData {}

/** proxied session value handed to user code as `update.session` */
export type SessionContext = SessionData & {
  $forceUpdate: () => Promise<void>
} & {
  [key: string]: unknown
}

export type AnyUpdate = UpdateKindMap[keyof UpdateKindMap] | CustomUpdate

export interface SessionOptions {
  /**
   * persistent backend; defaults to a fresh `MemoryStorage`. swap in
   * redis/sql/etc via any `KVStorage<unknown>` (or `TtlStorage` for sliding-window expiry)
   */
  storage?: KVStorage<unknown>
  /**
   * how to derive the storage key per update.
   * default: `from.id ?? senderChat.id ?? chat.id`; undefined → no session attached
   */
  getStorageKey?: (update: AnyUpdate) => string | undefined
  /** initial session value when storage is empty (default: `() => ({})`) */
  initial?: (update: AnyUpdate) => SessionData
}
