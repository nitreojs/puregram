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

## @puregram/storage-sqlite

_sqlite-backed `KVStorage` adapter for `puregram` — JSON-serialised values, native `expires_at` ttl, optional background sweep_

## installation

`better-sqlite3` is a **peer dependency**. install both:

```sh
$ yarn add @puregram/storage-sqlite better-sqlite3
$ npm i -S @puregram/storage-sqlite better-sqlite3
```

## quickstart

```ts
import { Telegram } from 'puregram'
import { session } from '@puregram/session'
import { SqliteStorage } from '@puregram/storage-sqlite'
import Database from 'better-sqlite3'

const db = new Database('./bot.sqlite')
const storage = new SqliteStorage({
  db,
  table: 'sessions',
  ttlMs: 7 * 24 * 60 * 60 * 1_000, // a week
  sweepIntervalMs: 60 * 60 * 1_000 // hourly batch cleanup
})

const telegram = Telegram.fromToken(process.env.TOKEN!)
  .extend(session({ storage }))

await telegram.startPolling()
```

`SqliteStorage` implements [`TtlStorage`](../storage), so any plugin that detects it via `isTtlStorage` automatically calls `touch()` after each read to slide the window forward without rewriting the payload

## options

| option | type | description |
|---|---|---|
| `db` | `SqliteLikeDatabase` | better-sqlite3 (or compatible) instance. structurally typed against the methods we use: `exec`, `prepare` |
| `table` | `string` | table name. default `puregram_kv`. created via `CREATE TABLE IF NOT EXISTS` on construction |
| `ttlMs` | `number` | default ttl applied on every `set`, in milliseconds. omit for keys that never expire |
| `sweepIntervalMs` | `number` | optional batch-eviction interval. when set, a background timer fires `DELETE FROM <table> WHERE expires_at < now()` |

## native ttl

ttl lives in an `INTEGER` column named `expires_at` (unix ms):

- `set(key, value)` stamps `Date.now() + ttlMs` when `ttlMs` is configured
- `get(key)` lazily evicts a single row whose `expires_at` has elapsed
- `sweep()` (manual or via `sweepIntervalMs`) deletes every expired row at once
- `touch(key)` reissues `UPDATE ... SET expires_at = ?` — handy for sliding-window sessions

leaving `ttlMs` unset stores rows without expiry and turns `touch` and `sweep` into safe no-ops

## schema

the adapter creates a single table:

```sql
CREATE TABLE IF NOT EXISTS <table> (
  key        TEXT    PRIMARY KEY,
  value      TEXT    NOT NULL,
  expires_at INTEGER
)
```

values are stored as JSON. you can read directly with SQL when debugging:

```sh
$ sqlite3 bot.sqlite "SELECT key, value, expires_at FROM sessions LIMIT 5"
```

## license

WTFPL
