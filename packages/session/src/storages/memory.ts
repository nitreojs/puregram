import { SessionStorage } from './storage'

export interface MemoryStoreLike<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V): this | undefined
  has(key: K): boolean
  delete(key: K): boolean
}

export interface MemoryStorageOptions {
  store: MemoryStoreLike<string, any>
}

export class MemoryStorage implements SessionStorage {
  private store: MemoryStorageOptions['store']

  constructor ({ store = new Map() }: Partial<MemoryStorageOptions> = {}) {
    this.store = store
  }

  async get (key: string) {
    return this.store.get(key)
  }

  async set (key: string, value: any) {
    this.store.set(key, value)

    return true
  }

  async has (key: string) {
    return this.store.has(key)
  }

  async delete (key: string) {
    return this.store.delete(key)
  }

  async touch () { }
}
