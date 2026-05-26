<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='../storage'><b>@puregram/storage</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/pureforum'><b>telegram forum</b></a>
</div>

## @puregram/storage-redis

_redis-backed `KVStorage` adapter for `puregram` — JSON-serialised values, native `PX` ttl, sliding-window `touch`_

## installation

`ioredis` is a **peer dependency**. install both:

```sh
$ yarn add @puregram/storage-redis ioredis
$ npm i -S @puregram/storage-redis ioredis
```

## quickstart

```ts
import { Telegram } from 'puregram'
import { session } from '@puregram/session'
import { RedisStorage } from '@puregram/storage-redis'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)
const storage = new RedisStorage({
  client: redis,
  prefix: 'sessions:',
  ttlMs: 7 * 24 * 60 * 60 * 1_000 // a week
})

const telegram = Telegram.fromToken(process.env.TOKEN!)
  .extend(session({ storage }))

await telegram.startPolling()
```

`RedisStorage` implements [`TtlStorage`](../storage), so any plugin that detects it via `isTtlStorage` automatically calls `touch()` after each read to slide the window forward without rewriting the payload

## options

| option | type | description |
|---|---|---|
| `client` | `RedisLikeClient` | ioredis (or compatible) instance. structurally typed against the methods we use: `get`, `set`, `del`, `exists`, `expire`, `pexpire`, `keys` |
| `prefix` | `string` | namespace prepended to every key. default `puregram:` |
| `ttlMs` | `number` | default ttl applied on every `set`, in milliseconds. omit for keys that never expire |

## native ttl

when `ttlMs` is set:

- `set(key, value)` writes with `SET key value PX <ttlMs>` — redis evicts the entry on expiry, you don't need a sweeper
- `touch(key)` reissues `PEXPIRE key <ttlMs>` — handy for session-style sliding windows

leaving `ttlMs` unset stores keys without expiry and turns `touch` into a no-op

## key listing

`keys()` walks `KEYS <prefix>*`. this is fine for development / small key spaces but **scans the entire keyspace** — for large deployments wrap an ioredis `SCAN` iterator yourself

## license

MPL-2.0
