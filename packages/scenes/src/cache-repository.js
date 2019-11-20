class CacheRepository {
  constructor({ sortingValues } = {}) {
    this.collection = new Map();
    this.keys = [];
    this.values = [];
    this.sortingValues = sortingValues;
  }

  has(key) {
    return this.collection.has(key);
  }

  set(key, value) {
    this.collection.set(key, value);

    this.keys = [...this.collection.keys()];
    this.values = [...this.collection.values()];

    if (this.sortingValues) {
      this.values.sort(this.sortingValues);
    }
  }

  get(key) {
    return this.collection.get(key) || null;
  }

  strictSet(key, value) {
    if (this.collection.has(key)) {
      throw new Error(`Value by ${key} already exists`);
    }

    return this.set(key, value);
  }

  strictGet(key) {
    let value = this.get(key);

    if (!value) {
      throw new Error(`Value by ${key} not found`);
    }

    return value;
  }

  [Symbol.iterator]() {
		return this.collection[Symbol.iterator]();
	}
}

module.exports = CacheRepository;
