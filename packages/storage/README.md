# @puregram/storage

shared key-value storage interfaces and in-process implementations for puregram v3.

consumed by `@puregram/session`, `@puregram/media-cacher`, and any other satellite that needs persistent state. ships two interfaces (`KVStorage<V>`, `TtlStorage<V>`) plus two memory-backed classes.

backend adapters for redis/sqlite/cloudflare/etc. are intentionally **not** in this package — userland implements `KVStorage<V>` directly, or future `@puregram/storage-<backend>` packages cover them post-v3.0 (matching `@gramio/storage-*` and `@grammyjs/storage-*` conventions).

## install

```sh
yarn add @puregram/storage
```

zero runtime dependencies.

## interfaces

```ts
import type { KVStorage, TtlStorage } from '@puregram/storage'

interface KVStorage<V = unknown> {
  get    (key: string): Promise<V | undefined>
  set    (key: string, value: V): Promise<void>
  delete (key: string): Promise<void>
  has    (key: string): Promise<boolean>

  // optional iteration; call defensively
  keys?    (): AsyncIterable<string>
  values?  (): AsyncIterable<V>
  entries? (): AsyncIterable<readonly [string, V]>
}

interface TtlStorage<V = unknown> extends KVStorage<V> {
  touch (key: string): Promise<void>
}
```

`TtlStorage` is the opt-in interface for backends with sliding-window expiry. consumers that may receive either accept `KVStorage<V>` and narrow at runtime via `isTtlStorage`.

```ts
import { isTtlStorage } from '@puregram/storage'

if (isTtlStorage(storage)) {
  await storage.touch(key)
}
```

## in-process backends

### `MemoryStorage<V>`

unbounded `Map`-backed store. no expiry, no eviction.

```ts
import { MemoryStorage } from '@puregram/storage'

const s = new MemoryStorage<number>()
await s.set('hits', 1)
const hits = await s.get('hits') // 1

// optional seed
const seeded = new MemoryStorage<number>([['a', 1], ['b', 2]])
```

### `LruMemoryStorage<V>`

bounded with least-recently-used eviction. constructor takes `{ max: number }`.

`get` and `set` on an existing key bump recency. `has` and `delete` do not.

```ts
import { LruMemoryStorage } from '@puregram/storage'

const cache = new LruMemoryStorage<string>({ max: 1000 })
await cache.set('key', 'value')
```

## userland adapter sketch

a 15-line redis adapter (illustrative — not shipped):

```ts
import type { TtlStorage } from '@puregram/storage'
import type { Redis } from 'ioredis'

export class RedisStorage<V = unknown> implements TtlStorage<V> {
  constructor (private readonly redis: Redis, private readonly ttlMs = 86_400_000) {}

  async get    (key: string)            { const v = await this.redis.get(key); return v === null ? undefined : JSON.parse(v) as V }
  async set    (key: string, value: V)  { await this.redis.set(key, JSON.stringify(value), 'PX', this.ttlMs) }
  async delete (key: string)            { await this.redis.del(key) }
  async has    (key: string)            { return (await this.redis.exists(key)) === 1 }
  async touch  (key: string)            { await this.redis.pexpire(key, this.ttlMs) }
}
```

## license

WTFPL
