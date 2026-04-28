// KVStorage's contract is async; sync backings still satisfy it via Promise-returning methods
/* eslint-disable @typescript-eslint/require-await */
import type { KVStorage } from './kv-storage'

const inspectSymbol = Symbol.for('nodejs.util.inspect.custom')

/**
 * unbounded in-process key-value storage backed by a `Map`. sync underneath
 * but presents the async {@link KVStorage} contract
 *
 * no expiry, no eviction. for bounded behavior use {@link LruMemoryStorage}
 */
export class MemoryStorage<V = unknown> implements KVStorage<V> {
  private readonly store: Map<string, V>

  constructor (entries?: Iterable<readonly [string, V]>) {
    this.store = new Map(entries)
  }

  /** number of entries currently held */
  get size (): number {
    return this.store.size
  }

  async get (key: string) {
    return this.store.get(key)
  }

  async set (key: string, value: V) {
    this.store.set(key, value)
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
    return `MemoryStorage(size=${this.store.size})`
  }
}
