<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/puregram/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#writing-your-own-storage'><b>writing your own</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/pureforum'><b>telegram forum</b></a>
</div>

## @puregram/storage

_shared key-value storage interfaces for `puregram` package — plus two batteries-included in-process implementations_

### introduction

every plugin in the `puregram` ecosystem that needs to keep state between updates — `@puregram/session`, `@puregram/scenes`, `@puregram/media-cacher`, `@puregram/rate-limit`, `@puregram/flow` — talks to its backing store through the same tiny interface defined here. that's the whole point: write your storage adapter once, plug it into every plugin

if you don't care about persistence, the bundled `MemoryStorage` is what every satellite uses by default. if you do — redis, sqlite, cloudflare kv, a json file on disk, a dynamodb table, whatever — you implement `KVStorage<V>` and pass it in

### example

```ts
import { Telegram } from 'puregram'
import { session } from '@puregram/session'
import { MemoryStorage } from '@puregram/storage'

const telegram = Telegram.fromToken(process.env.TOKEN!)
  .extend(session({ storage: new MemoryStorage() }))

telegram.onMessage(async (message) => {
  message.session.counter = (message.session.counter ?? 0) + 1
  await message.send(`hit ${message.session.counter}`)
})

await telegram.startPolling()
```

### installation

```sh
$ yarn add @puregram/storage
$ npm i -S @puregram/storage
```

most of the time you don't install this directly — it comes in transitively through whichever satellite you're using. install it explicitly when you want to **share one storage instance across multiple plugins**, or when you're **writing your own adapter** and need the type imports

---

## what's exported

### `MemoryStorage<V>`

unbounded in-process kv backed by `Map`. fast, simple, ephemeral — the moment your bot restarts, it's empty. perfect for development and stateless bots, fine for production when state really doesn't need to survive a deploy

```ts
import { MemoryStorage } from '@puregram/storage'

const storage = new MemoryStorage<number>()

await storage.set('counter', 1)
await storage.set('counter', (await storage.get('counter') ?? 0) + 1)

console.log(await storage.get('counter')) // 2
```

an optional `entries` argument seeds the map at construction:

```ts
const storage = new MemoryStorage<string>([['a', '1'], ['b', '2']])

console.log(storage.size) // 2
```

### `LruMemoryStorage<V>`

bounded in-process kv with LRU eviction. same shape as `MemoryStorage`, but keeps at most `max` entries — when you set the `max + 1`th key, the least-recently-used one gets evicted. great for media-cacher (cap how many `file_id`s you remember), rate-limit (cap how many users you track), or any unbounded-by-default cache that you'd rather have a hard ceiling on

```ts
import { LruMemoryStorage } from '@puregram/storage'

const storage = new LruMemoryStorage<string>({ max: 1000 })

await storage.set('a', 'b')

console.log(storage.size) // 1
```

`get(key)` and `set(key, value)` bump the entry to the back of the iteration order (most recent). `has` and `delete` don't bump — they're observation, not access. iteration order is oldest → newest, so when you walk it you see eviction candidates first

### `KVStorage<V>` interface

the contract every storage adapter has to satisfy. four required methods, three optional iterators:

```ts
interface KVStorage<V> {
  get (key: string): Promise<V | undefined>
  set (key: string, value: V): Promise<void>
  delete (key: string): Promise<void>
  has (key: string): Promise<boolean>

  // optional — adapters skip these when iteration is expensive (cloudflare kv, dynamodb, …)
  keys?: () => AsyncIterable<string>
  values?: () => AsyncIterable<V>
  entries?: () => AsyncIterable<readonly [string, V]>
}
```

a few intentional choices:

- **all methods return Promises**, even on sync backings. consumers never have to write `await maybeAsync(...)` ceremony — they just `await`. `MemoryStorage` is implemented with `async` methods that don't actually await anything, and that's fine
- **`V` is generic at the storage level**, not per-call. once you've typed it as `KVStorage<{ counter: number }>`, you can't accidentally `set('k', 'a string')` somewhere else. consumers can't silently bypass the declared shape
- **iterators are optional.** if your backend can't list keys cheaply, just leave them off. callers do `for await (const k of storage.keys?.() ?? []) ...` defensively

### `TtlStorage<V>` interface

extends `KVStorage<V>` with one extra method — `touch(key)` — for backends that support sliding-window expiry (redis `EXPIRE`, sqlite `last_seen` columns, …). consumers like `@puregram/session` runtime-check via `isTtlStorage(storage)` and call `touch` after each access to roll the timer without rewriting the value:

```ts
interface TtlStorage<V> extends KVStorage<V> {
  touch (key: string): Promise<void>
}
```

### `isTtlStorage(storage)` typeguard

```ts
import { isTtlStorage, type KVStorage } from '@puregram/storage'

function maybeTouch (storage: KVStorage<unknown>, key: string) {
  if (isTtlStorage(storage)) {
    // narrowed to TtlStorage<unknown>
    return storage.touch(key)
  }
}
```

returns `true` when `typeof storage.touch === 'function'`. if you're writing a plugin that wants to take advantage of ttl when present and silently degrade when not, this is the check

---

<a name='writing-your-own-storage'></a>
## writing your own storage

every official adapter (redis, sqlite, file-based, cloudflare kv) is just a class implementing `KVStorage<V>`. there's no magic, no base class to extend, no registration step

### the minimal four

write `get` / `set` / `delete` / `has`. that's it — the satellites only need these four to function

```ts
import type { KVStorage } from '@puregram/storage'

interface RedisClient {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string) => Promise<void>
  del: (key: string) => Promise<number>
  exists: (key: string) => Promise<number>
}

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

if your backend supports expiring keys, implement `TtlStorage<V>` instead — it's the same four methods plus `touch`:

```ts
import type { TtlStorage } from '@puregram/storage'

export class RedisTtlStorage<V> implements TtlStorage<V> {
  // ...the four required methods...

  /** roll the ttl forward without rewriting the value */
  async touch (key: string) {
    await this.redis.expire(this.prefix + key, this.ttlSeconds)
  }
}
```

session middleware (and anything else built on top) auto-detects `touch` via `isTtlStorage` and calls it after every read. you don't have to wire it up — implement the method, it works

### typing the `V`

the generic is on the **class**, not on each method, so you'd typically expose your adapter generically and let the satellite parameterise it:

```ts
const sessionStore = new RedisStorage<{ counter: number }>(redis)
const cacheStore = new RedisStorage<string>(redis, 'cache:')

telegram
  .extend(session({ storage: sessionStore }))
  .extend(mediaCacher({ storage: cacheStore }))
```

each satellite documents what `V` it expects: `@puregram/session` uses `unknown` (it's user-shaped), `@puregram/media-cacher` uses `string` (file_ids), `@puregram/rate-limit` uses `RateLimitEntry`, etc

### iteration

the three iterator methods (`keys`, `values`, `entries`) are optional. implement them when your backend can iterate cheaply (in-process maps, sqlite, postgres). leave them off when iteration is `O(everything)` (cloudflare kv, dynamodb without an index). consumers that want to enumerate do it defensively:

```ts
for await (const key of storage.keys?.() ?? []) {
  console.log(key)
}
```

---

## `enhanceStorage(base, opts)`

wraps any `KVStorage<V>` with **versioned migrations** and optional per-entry expiry. payloads are encoded as `{ __v, __exp?, data }` on the backing store — when you bump the migration version, old entries upgrade lazily on next read, transparently to the consumer

```ts
import { enhanceStorage, MemoryStorage } from '@puregram/storage'

interface SessionV3 {
  counter: number
  role: 'guest' | 'user'
  kind: 'session'
}

const storage = enhanceStorage<SessionV3>(new MemoryStorage(), {
  migrations: {
    1: (d: any) => ({ ...d, role: 'guest' }),
    2: (d: any) => ({ ...d, kind: 'session' }),
    3: (d: any) => ({ ...d, counter: d.counter ?? 0 })
  }
})
```

| option | type | description |
|---|---|---|
| `migrations` | `Record<number, (data) => V \| Promise<V>>` | keyed by target version. `migrations[1]` runs to upgrade v0 → v1, `migrations[2]` runs after to upgrade v1 → v2, and so on. the latest key wins as the "current version" stamped on every `set` |
| `millisecondPrecision` | `boolean` | when `true`, preserves any `__exp` (unix ms) carried on the underlying envelope across re-writes |

semantics:

- legacy unversioned values are treated as **v0** and migrated forward on first read
- expired entries (`__exp < Date.now()`) return `undefined` from `get`, `false` from `has`, and are deleted from the base storage on read
- migrated envelopes are written back at the current version, so subsequent reads skip the upgrade
- concurrent reads converge on the same migrated payload (last write wins)
- `keys`, `values`, `entries` and `touch` are forwarded when the base implements them. `values`/`entries` unwrap the envelope and skip expired entries
- wrapping a `TtlStorage` returns a `TtlStorage`, so `isTtlStorage(enhanceStorage(base))` stays `true` and sliding-window expiry keeps working through the wrapper

### batteries-included adapters

| package | backend | native ttl |
|---|---|---|
| [`@puregram/storage-redis`](../storage-redis) | redis via `ioredis` | `PX` / `PEXPIRE` |
| [`@puregram/storage-sqlite`](../storage-sqlite) | sqlite via `better-sqlite3` | `expires_at` column + optional sweep |
