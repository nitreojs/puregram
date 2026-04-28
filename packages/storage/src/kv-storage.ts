/**
 * minimal async key-value storage contract. all methods return Promises so
 * consumers never need a `MaybePromise`-style cast for sync vs async backends
 *
 * value type is generic at the storage level. there is no per-call generic
 * override because that would let callers silently bypass the storage's
 * declared value type
 */
export interface KVStorage<V = unknown> {
  /** read the value for a key, or undefined if absent */
  get: (key: string) => Promise<V | undefined>

  /** write a value for a key, replacing any existing entry */
  set: (key: string, value: V) => Promise<void>

  /** remove a key. no-op if the key does not exist */
  delete: (key: string) => Promise<void>

  /** report whether a key has any value, including `undefined` written explicitly */
  has: (key: string) => Promise<boolean>

  /**
   * optional iteration. adapters skip these when the backend cannot iterate
   * cheaply (e.g. cloudflare KV). consumers call them defensively:
   *
   *   for await (const k of storage.keys?.() ?? []) { … }
   */
  keys?: () => AsyncIterable<string>
  values?: () => AsyncIterable<V>
  entries?: () => AsyncIterable<readonly [string, V]>
}

/**
 * KVStorage with sliding-window expiry semantics. backends with ttl support
 * (redis EXPIRE, sqlite last_seen, etc.) implement `touch` to roll the timer
 * for a key without rewriting its value
 *
 * consumers that want to support both ttl and non-ttl backends accept
 * `KVStorage<V>` and runtime-check via {@link isTtlStorage}
 */
export interface TtlStorage<V = unknown> extends KVStorage<V> {
  /**
   * mark a key as still active. backends with sliding-window expiry use this
   * to extend the key's lifetime. on backends without expiry semantics this
   * is a no-op (and they should implement KVStorage, not TtlStorage)
   */
  touch: (key: string) => Promise<void>
}

/**
 * runtime typeguard narrowing a `KVStorage<V>` to `TtlStorage<V>` when the
 * backend implements `touch`. lets consumers decide at runtime whether the
 * configured storage supports sliding-window expiry
 */
// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isTtlStorage<V> (storage: KVStorage<V>): storage is TtlStorage<V> {
  return typeof (storage as TtlStorage<V>).touch === 'function'
}
