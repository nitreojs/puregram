type CacheRepositorySortingValues<Value> = (a: Value, b: Value) => number

export interface CacheRepositoryOptions<Value> {
  sortingValues?: CacheRepositorySortingValues<Value>
}

export class CacheRepository<Key, Value> {
  keys: Key[] = []
  values: Value[] = []

  private readonly collection = new Map<Key, Value>()
  private readonly sortingValues: CacheRepositorySortingValues<Value> | undefined

  constructor (options: CacheRepositoryOptions<Value> = {}) {
    this.sortingValues = options.sortingValues
  }

  has (key: Key) {
    return this.collection.has(key)
  }

  set (key: Key, value: Value) {
    this.collection.set(key, value)
    this.refresh()
  }

  get (key: Key): Value | undefined {
    return this.collection.get(key)
  }

  delete (key: Key) {
    const removed = this.collection.delete(key)

    if (removed) {
      this.refresh()
    }

    return removed
  }

  strictSet (key: Key, value: Value) {
    if (this.collection.has(key)) {
      throw new Error(`value by ${String(key)} already exists`)
    }

    this.set(key, value)
  }

  strictGet (key: Key) {
    const value = this.collection.get(key)

    if (value === undefined) {
      throw new Error(`value by ${String(key)} not found`)
    }

    return value
  }

  [Symbol.iterator] () {
    return this.collection[Symbol.iterator]()
  }

  private refresh () {
    this.keys = [...this.collection.keys()]
    this.values = [...this.collection.values()]

    if (this.sortingValues) {
      this.values.sort(this.sortingValues)
    }
  }
}
