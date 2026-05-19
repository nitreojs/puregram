import type { TtlStorage } from '@puregram/storage'

/**
 * minimal slice of the ioredis surface — structural so adapters can hand in
 * ioredis, node-redis with a wrapper, or a mock
 */
export interface RedisLikeClient {
  get: (key: string) => Promise<string | null>
  set: ((key: string, value: string) => Promise<unknown>) & ((key: string, value: string, mode: 'PX', ms: number) => Promise<unknown>)
  del: (key: string) => Promise<unknown>
  exists: (key: string) => Promise<number>
  expire: (key: string, seconds: number) => Promise<unknown>
  pexpire: (key: string, ms: number) => Promise<unknown>
  keys: (pattern: string) => Promise<string[]>
}

/** options accepted by {@link RedisStorage} */
export interface RedisStorageOptions {
  /** ioredis (or compatible) client instance */
  client: RedisLikeClient
  /** namespace applied to every key. defaults to `puregram:` */
  prefix?: string
  /**
   * default ttl applied to every {@link RedisStorage.set} call, in milliseconds.
   * leave undefined for keys that never expire. {@link RedisStorage.touch}
   * rolls the same ttl forward when invoked
   */
  ttlMs?: number
}

/**
 * redis-backed {@link TtlStorage}. values are JSON-serialised on write and
 * parsed on read. native ttl uses `PX` / `PEXPIRE` so the precision survives
 * sub-second windows
 */
export class RedisStorage<V = unknown> implements TtlStorage<V> {
  private readonly client: RedisLikeClient
  private readonly prefix: string
  private readonly ttlMs: number | undefined

  constructor (options: RedisStorageOptions) {
    this.client = options.client
    this.prefix = options.prefix ?? 'puregram:'
    this.ttlMs = options.ttlMs
  }

  /** namespace prepended to every key handed to the client */
  get keyPrefix () {
    return this.prefix
  }

  async get (key: string): Promise<V | undefined> {
    const raw = await this.client.get(this.prefix + key)

    if (raw === null) {
      return undefined
    }

    return JSON.parse(raw) as V
  }

  async set (key: string, value: V) {
    const payload = JSON.stringify(value)

    if (this.ttlMs !== undefined) {
      await this.client.set(this.prefix + key, payload, 'PX', this.ttlMs)

      return
    }

    await this.client.set(this.prefix + key, payload)
  }

  async delete (key: string) {
    await this.client.del(this.prefix + key)
  }

  async has (key: string) {
    return (await this.client.exists(this.prefix + key)) === 1
  }

  /** roll the configured ttl forward without rewriting the value */
  async touch (key: string) {
    if (this.ttlMs === undefined) {
      return
    }

    await this.client.pexpire(this.prefix + key, this.ttlMs)
  }

  async * keys (): AsyncIterable<string> {
    const matched = await this.client.keys(this.prefix + '*')

    for (const k of matched) {
      yield k.slice(this.prefix.length)
    }
  }
}
