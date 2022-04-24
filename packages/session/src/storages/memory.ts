import { SessionStorage } from './storage'

export interface MemoryStoreLike<K, V> {
  get(key: K): V | undefined

  set(key: K, value: V): this | undefined

  delete(key: K): boolean
}

export interface MemoryStorageOptions {
  store: MemoryStoreLike<string, object>
}

export class MemoryStorage implements SessionStorage {
  private store: MemoryStorageOptions['store']

  constructor({ store = new Map() }: Partial<MemoryStorageOptions> = {}) {
    this.store = store
  }

  async get(key: string): Promise<object | undefined> {
    return this.store.get(key)
  }

  async set(key: string, value: object): Promise<boolean> {
    this.store.set(key, value)

    return true
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key)
  }

  async touch(): Promise<void> { }
}
