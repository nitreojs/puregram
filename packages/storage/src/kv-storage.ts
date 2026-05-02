/**
 * minimal async key-value storage contract. all methods return Promises so
 * consumers never need a `MaybePromise` cast across sync/async backends.
 * value type is generic at the storage level — no per-call generic, so
 * callers can't silently bypass the declared type
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
   * optional iteration — adapters skip these when the backend can't iterate
   * cheaply (e.g. cloudflare KV). call defensively:
   *
   * @example
   * ```ts
   * for await (const k of storage.keys?.() ?? []) { … }
   * ```
   */
  keys?: () => AsyncIterable<string>
  values?: () => AsyncIterable<V>
  entries?: () => AsyncIterable<readonly [string, V]>
}

/**
 * KVStorage with sliding-window expiry. backends with ttl (redis EXPIRE,
 * sqlite last_seen, …) implement `touch` to roll the timer without rewriting
 * the value. consumers that want both ttl and non-ttl backends accept
 * `KVStorage<V>` and runtime-check via {@link isTtlStorage}
 */
export interface TtlStorage<V = unknown> extends KVStorage<V> {
  /** mark a key as still active — backends with sliding-window expiry extend its lifetime */
  touch: (key: string) => Promise<void>
}

/** runtime typeguard — narrows `KVStorage<V>` to `TtlStorage<V>` when `touch` is implemented */
// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate needed for narrowing
export function isTtlStorage<V> (storage: KVStorage<V>): storage is TtlStorage<V> {
  return typeof (storage as TtlStorage<V>).touch === 'function'
}
