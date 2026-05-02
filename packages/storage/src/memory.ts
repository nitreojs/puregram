/* eslint-disable @typescript-eslint/require-await -- KVStorage contract is async; sync backing still satisfies it */
import type { KVStorage } from './kv-storage'

const inspectSymbol = Symbol.for('nodejs.util.inspect.custom')

/** unbounded in-process KV backed by `Map`. no expiry, no eviction — use {@link LruMemoryStorage} when bounded */
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
