type CacheRepositorySortingValues<Value> = (a: Value, b: Value) => number

export class CacheRepository<Key, Value> {
  private readonly collection: Map<Key, Value> = new Map()

  keys: Key[] = []
  values: Value[] = []

  protected sortingValues?: CacheRepositorySortingValues<Value>

  constructor({ sortingValues }: {
    sortingValues?: CacheRepositorySortingValues<Value>
  } = {}) {
    this.sortingValues = sortingValues
  }

  /** Checks has value by key */
  has(key: Key) {
    return this.collection.has(key)
  }

  /** Sets value by key */
  set(key: Key, value: Value) {
    this.collection.set(key, value)

    this.keys = [...this.collection.keys()]
    this.values = [...this.collection.values()]

    if (this.sortingValues) {
      this.values.sort(this.sortingValues)
    }
  }

  /** Returns value by key */
  get(key: Key): Value | undefined {
    return this.collection.get(key)
  }

  /** Sets value by key else error if exits */
  strictSet(key: Key, value: Value) {
    if (this.collection.has(key)) {
      throw new Error(`value by ${key} already exists`)
    }

    return this.set(key, value)
  }

  /** Returns value by key else error */
  strictGet(key: Key): Value {
    const value: Value | undefined = this.get(key)

    if (!value) {
      throw new Error(`value by ${key} not found`)
    }

    return value
  }

  /** Returns iterator */
  [Symbol.iterator](): IterableIterator<[Key, Value]> {
    return this.collection[Symbol.iterator]()
  }
}
