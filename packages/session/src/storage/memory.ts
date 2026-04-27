import type { SessionStorage } from './storage'

export interface MemoryStoreLike<K, V> {
  get: (key: K) => V | undefined
  set: (key: K, value: V) => this | undefined
  has: (key: K) => boolean
  delete: (key: K) => boolean
}

export interface MemoryStorageOptions {
  store: MemoryStoreLike<string, unknown>
}

export class MemoryStorage implements SessionStorage {
  private readonly store: MemoryStoreLike<string, unknown>

  constructor (options: Partial<MemoryStorageOptions> = {}) {
    this.store = options.store ?? new Map<string, unknown>()
  }

  get (key: string) {
    return Promise.resolve(this.store.get(key))
  }

  set (key: string, value: unknown) {
    this.store.set(key, value)

    return Promise.resolve(true)
  }

  has (key: string) {
    return Promise.resolve(this.store.has(key))
  }

  delete (key: string) {
    return Promise.resolve(this.store.delete(key))
  }

  touch (_key: string) {
    return Promise.resolve()
  }
}
