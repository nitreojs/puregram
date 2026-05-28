---
title: '@puregram/storage'
description: shared KVStorage and TtlStorage interfaces, two batteries-included in-memory implementations, enhanceStorage migrations, and the bundled redis and sqlite adapters
---

# `@puregram/storage`

every plugin in the puregram ecosystem that needs persistent state — [`@puregram/session`](/plugins/session), [`@puregram/scenes`](/plugins/scenes), [`@puregram/flow`](/plugins/flow/) (persistent flows), [`@puregram/media-cacher`](/plugins/media-cacher), [`@puregram/rate-limit`](/plugins/rate-limit) — talks to its backing store through the same tiny interface defined here. write your adapter once, plug it into any plugin

## when to use

you rarely install this package directly. it comes in transitively through whichever satellite you're using. install it explicitly when you want to:

- **share one storage instance across multiple plugins** (session + rate-limit against the same redis)
- **write a custom adapter** and need the `KVStorage<V>` / `TtlStorage<V>` type imports
- **use `enhanceStorage`** for versioned migrations

## install

::: code-group

```sh [yarn]
yarn add @puregram/storage
```

```sh [npm]
npm i -S @puregram/storage
```

```sh [pnpm]
pnpm add @puregram/storage
```

:::

## core api

### `KVStorage<V>` interface

the contract every adapter has to satisfy — four required async methods, three optional iterators:

```ts
interface KVStorage<V> {
  get (key: string): Promise<V | undefined>
  set (key: string, value: V): Promise<void>
  delete (key: string): Promise<void>
  has (key: string): Promise<boolean>

  // optional — skip when iteration is expensive (cloudflare kv, dynamodb, …)
  keys?: () => AsyncIterable<string>
  values?: () => AsyncIterable<V>
  entries?: () => AsyncIterable<readonly [string, V]>
}
```

a few intentional design choices:

- **all methods return `Promise`**, even on sync backends. consumers never write `await maybeAsync(...)` ceremony
- **`V` is generic at the class level**, not per-call — once you type it as `KVStorage<{ counter: number }>`, you can't accidentally `set('k', 'a string')`
- **iterators are optional** — leave them off when your backend can't iterate cheaply. consumers guard with `storage.keys?.() ?? []`

### `TtlStorage<V>` interface

extends `KVStorage<V>` with a `touch(key)` method for backends that support sliding-window expiry (redis `EXPIRE`, sqlite `last_seen` columns):

```ts
interface TtlStorage<V> extends KVStorage<V> {
  touch (key: string): Promise<void>
}
```

`@puregram/session` auto-detects via `isTtlStorage` and calls `touch` after each access to roll the backend timer without rewriting the value

### `isTtlStorage(storage)`

runtime typeguard — narrows `KVStorage<V>` to `TtlStorage<V>` when `touch` is present:

```ts
import { isTtlStorage, type KVStorage } from '@puregram/storage'

function maybeTouch (storage: KVStorage<unknown>, key: string) {
  if (isTtlStorage(storage)) {
    return storage.touch(key)
  }
}
```

### `MemoryStorage<V>`

unbounded in-process kv backed by `Map`. fast, simple, ephemeral — gone on restart. the default for every satellite that doesn't receive an explicit `storage` option

```ts
import { MemoryStorage } from '@puregram/storage'

const storage = new MemoryStorage<number>()

await storage.set('counter', 1)
console.log(await storage.get('counter'))
```

seed at construction:

```ts
const storage = new MemoryStorage<string>([['a', '1'], ['b', '2']])
console.log(storage.size)
```

### `LruMemoryStorage<V>`

bounded in-process kv with LRU eviction. keeps at most `max` entries — when `max + 1` is set, the least-recently-used entry is evicted. `get` and `set` bump recency; `has` and `delete` don't

```ts
import { LruMemoryStorage } from '@puregram/storage'

const storage = new LruMemoryStorage<string>({ max: 1_000 })

await storage.set('a', 'hello')
console.log(storage.size)
```

great for media-cacher (cap remembered `file_id`s), rate-limit (cap tracked users), or any cache that needs a hard ceiling

## `enhanceStorage(base, opts)`

wraps any `KVStorage<V>` with **versioned migrations** and optional per-entry expiry. payloads are stored as `{ __v, __exp?, data }` envelopes — old entries upgrade lazily on next read

```ts
import { enhanceStorage, MemoryStorage } from '@puregram/storage'

interface SessionV3 {
  counter: number
  role: 'guest' | 'user'
}

const storage = enhanceStorage<SessionV3>(new MemoryStorage(), {
  migrations: {
    1: d => ({ ...d, role: 'guest' }),
    2: d => ({ ...d, counter: (d as { counter?: number }).counter ?? 0 })
  }
})
```

| option | type | description |
|---|---|---|
| `migrations` | `Record<number, (data: unknown) => unknown>` | keyed by target version. `migrations[1]` upgrades v0 → v1, `migrations[2]` runs next to upgrade v1 → v2. the latest key wins as the current version stamped on every `set` |
| `millisecondPrecision` | `boolean` | when `true`, preserves any `__exp` (unix ms) carried on the envelope across re-writes |

semantics:

- legacy unversioned values are treated as **v0** and migrated forward on first read
- expired entries (`__exp < Date.now()`) return `undefined` and are deleted from the base storage
- migrated envelopes are written back at the current version — subsequent reads skip the upgrade
- concurrent reads converge (last write wins)

## writing your own adapter

implement `KVStorage<V>` — no base class, no registration step, just the four methods:

```ts
import type { KVStorage } from '@puregram/storage'

export class RedisStorage<V> implements KVStorage<V> {
  constructor (private readonly redis: RedisClient, private readonly prefix = 'pg:') {}

  async get (key: string): Promise<V | undefined> {
    const raw = await this.redis.get(this.prefix + key)

    return raw === null ? undefined : JSON.parse(raw) as V
  }

  async set (key: string, value: V) {
    await this.redis.set(this.prefix + key, JSON.stringify(value))
  }

  async delete (key: string) {
    await this.redis.del(this.prefix + key)
  }

  async has (key: string) {
    return (await this.redis.exists(this.prefix + key)) === 1
  }
}
```

then plug it in:

```ts
const telegram = Telegram.fromToken(TOKEN)
  .extend(session({ storage: new RedisStorage(redis) }))
```

### opting into ttl

if your backend supports expiring keys, implement `TtlStorage<V>` and add `touch`:

```ts
import type { TtlStorage } from '@puregram/storage'

export class RedisTtlStorage<V> implements TtlStorage<V> {
  // ...the four required methods...

  async touch (key: string) {
    await this.redis.pexpire(this.prefix + key, this.ttlMs)
  }
}
```

session middleware auto-detects `touch` via `isTtlStorage` and calls it after every read — you don't need to wire anything up

### adding iterators

implement the three optional iterator methods when your backend can iterate cheaply:

```ts
async * keys () {
  for (const k of await this.redis.keys(this.prefix + '*')) {
    yield k.slice(this.prefix.length)
  }
}
```

consumers guard defensively — `for await (const k of storage.keys?.() ?? []) ...` — so leaving them off is always safe

## bundled adapters

two adapters ship as separate packages. install them alongside `@puregram/storage` when you need a persistent backend out of the box

### `@puregram/storage-redis`

redis-backed `TtlStorage` via an ioredis-compatible client. values are JSON-serialised. native ttl uses `PX` / `PEXPIRE`

::: code-group

```sh [yarn]
yarn add @puregram/storage-redis ioredis
```

```sh [npm]
npm i -S @puregram/storage-redis ioredis
```

```sh [pnpm]
pnpm add @puregram/storage-redis ioredis
```

:::

```ts
import Redis from 'ioredis'
import { RedisStorage } from '@puregram/storage-redis'
import { session } from '@puregram/session'

const redis = new Redis()

const telegram = Telegram.fromToken(TOKEN)
  .extend(session({
    storage: new RedisStorage({ client: redis, ttlMs: 86_400_000 })
  }))
```

`RedisStorage` options:

| option | type | default | description |
|---|---|---|---|
| `client` | `RedisLikeClient` | required | ioredis (or compatible) client instance |
| `prefix` | `string` | `'puregram:'` | namespace prepended to every key |
| `ttlMs` | `number` | `undefined` | default ttl in ms applied on every `set`. `touch` rolls it forward |

### `@puregram/storage-sqlite`

sqlite-backed `TtlStorage` via a `better-sqlite3`-compatible database handle. values are JSON-serialised. ttl stored as `expires_at` integer column; `get` evicts expired rows lazily; an optional sweep timer batches eviction

::: code-group

```sh [yarn]
yarn add @puregram/storage-sqlite better-sqlite3
```

```sh [npm]
npm i -S @puregram/storage-sqlite better-sqlite3
```

```sh [pnpm]
pnpm add @puregram/storage-sqlite better-sqlite3
```

:::

```ts
import Database from 'better-sqlite3'
import { SqliteStorage } from '@puregram/storage-sqlite'
import { session } from '@puregram/session'

const db = new Database('bot.db')

const telegram = Telegram.fromToken(TOKEN)
  .extend(session({
    storage: new SqliteStorage({ db, ttlMs: 86_400_000, sweepIntervalMs: 60_000 })
  }))
```

`SqliteStorage` options:

| option | type | default | description |
|---|---|---|---|
| `db` | `SqliteLikeDatabase` | required | better-sqlite3 (or compatible) database handle |
| `table` | `string` | `'puregram_kv'` | table name. created via `CREATE TABLE IF NOT EXISTS` on construction |
| `ttlMs` | `number` | `undefined` | default ttl in ms. stored in `expires_at` column |
| `sweepIntervalMs` | `number` | `undefined` | background sweep interval in ms. when set, periodically deletes expired rows. omit to rely on lazy per-read eviction only |

call `storage.close()` when shutting down gracefully to stop the sweep timer

## which plugins consume storage

| plugin | `V` type | notes |
|---|---|---|
| `@puregram/session` | `unknown` | user-shaped payload, cast by the user |
| `@puregram/flow` (persistent flows) | depends on payload type | see the [flow/persistent-flows](/plugins/flow/persistent-flows) page |
| `@puregram/media-cacher` | `string` | stores `file_id` strings |
| `@puregram/rate-limit` | internal entry type | — |

## exported types

```ts
import type {
  KVStorage,
  TtlStorage,
  LruMemoryStorageOptions,
  EnhanceStorageOptions
} from '@puregram/storage'
```

## see also

- [session plugin](/plugins/session) — the primary consumer; shares this storage contract
- [flow/persistent-flows](/plugins/flow/persistent-flows) — flow persistence uses the same interface
- [plugins & .extend](/guide/concepts/plugins) — how plugins are installed
