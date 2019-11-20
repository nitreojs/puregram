class MemoryStorage {
  constructor({ store = new Map() } = {}) {
    this.store = store;
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async set(key, value) {
    this.store.set(key, value);

		return true;
  }

  async delete(key) {
    return this.store.delete(key);
  }

  async touch() {
		// ...
	}
}

module.exports = MemoryStorage;
