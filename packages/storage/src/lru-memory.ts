// KVStorage's contract is async; sync backings still satisfy it via Promise-returning methods
/* eslint-disable @typescript-eslint/require-await */
import type { KVStorage } from './kv-storage'

const inspectSymbol = Symbol.for('nodejs.util.inspect.custom')

export interface LruMemoryStorageOptions {
  /** maximum number of entries before eviction kicks in. must be > 0 */
  max: number
}

/**
 * bounded in-process key-value storage with least-recently-used eviction.
 * uses `Map`'s insertion-order iteration to track recency: `get` and `set`
 * on an existing key delete + reinsert to bump the entry to "most recent"
 *
 * note: {@link has} does **not** bump recency — checking for a key's
 * existence does not count as "use". {@link delete} does not bump either
 *
 * iteration order is oldest → newest, matching `Map` semantics
 */
export class LruMemoryStorage<V = unknown> implements KVStorage<V> {
  private readonly store = new Map<string, V>()
  private readonly max: number

  constructor (options: LruMemoryStorageOptions) {
    if (!Number.isFinite(options.max) || options.max <= 0) {
      throw new RangeError('LruMemoryStorage: max must be a positive finite number')
    }

    this.max = options.max
  }

  /** number of entries currently held (always <= max) */
  get size (): number {
    return this.store.size
  }

  async get (key: string) {
    if (!this.store.has(key)) {
      return undefined
    }

    const value = this.store.get(key) as V

    // bump recency: re-insert at the back of the iteration order
    this.store.delete(key)
    this.store.set(key, value)

    return value
  }

  async set (key: string, value: V) {
    // delete-then-insert ensures the key lands at the back regardless of
    // whether it existed already
    this.store.delete(key)
    this.store.set(key, value)

    if (this.store.size > this.max) {
      // first key in insertion order = least recently used
      const oldest: IteratorResult<string> = this.store.keys().next()

      if (oldest.done !== true) {
        this.store.delete(oldest.value)
      }
    }
  }

  async delete (key: string) {
    this.store.delete(key)
  }

  async has (key: string) {
    return this.store.has(key)
  }

  async * keys () {
    for (const k of this.store.keys()) {
      yield k
    }
  }

  async * values () {
    for (const v of this.store.values()) {
      yield v
    }
  }

  async * entries (): AsyncIterable<readonly [string, V]> {
    for (const e of this.store.entries()) {
      yield e
    }
  }

  [inspectSymbol] () {
    return `LruMemoryStorage(size=${this.store.size}, max=${this.max})`
  }
}
