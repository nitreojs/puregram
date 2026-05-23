import type { KVStorage } from '@puregram/storage'

const KEY = 'subscribers'

/** persistent set of user ids the bot has talked to */
export class SubscriberStore {
  constructor (private readonly storage: KVStorage<unknown>) {}

  async list () {
    return ((await this.storage.get(KEY)) as number[] | undefined) ?? []
  }

  async size () {
    return (await this.list()).length
  }

  async has (userId: number) {
    return (await this.list()).includes(userId)
  }

  async add (userId: number) {
    const ids = await this.list()

    if (ids.includes(userId)) {
      return
    }

    await this.storage.set(KEY, [...ids, userId])
  }

  async remove (userId: number) {
    const ids = await this.list()
    const filtered = ids.filter(id => id !== userId)

    if (filtered.length === ids.length) {
      return
    }

    await this.storage.set(KEY, filtered)
  }
}
