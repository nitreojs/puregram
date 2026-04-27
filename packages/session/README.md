# @puregram/session

> v3 alpha — work in progress.

transparent persistent session plugin for puregram v3:

- `session()` plugin — `tg.extend(session())` attaches `update.session` (a transparent proxy of stored data) and `tg.session.{get, set, delete}` (direct storage access).
- `ttl(value, ms)` — wrap a value to make it expire on read after `ms` milliseconds. lazy, no background timer.
- `MemoryStorage` — default in-memory backend. ships out of the box. plug your own `SessionStorage` for redis/sql/etc.

> **future:** non-memory backends (`RedisStorage`, `PostgresStorage`, `SqliteStorage`, `RedisJsonStorage`, ...) will land in a separate `@puregram/storage` package once there are 2+ confirmed backends. for now `SessionStorage` is the public interface — implement it against your store and pass it via `session({ storage: yourStorage })`.

## typing

`update.session` is typed via declaration-merging: importing `@puregram/session` augments every supported update class (`MessageUpdate`, `CallbackQueryUpdate`, ...) with a required `session: SessionContext` field. **importing the package implies usage** — there is no per-file opt-out. if you don't want session typing on every handler, don't import `@puregram/session`.

users widen the typed surface by augmenting the empty `SessionData` interface:

```ts
declare module '@puregram/session' {
  interface SessionData {
    counter: number
    user: { name: string }
  }
}

tg.on('message', async msg => {
  msg.session.counter = (msg.session.counter ?? 0) + 1
})
```

`SessionData` is a **single global shape** — every augmented update kind sees the same fields. for per-kind shapes, add your own private declaration-merge directly on the relevant update interface.

## what gets change-tracked

`update.session` is a transparent proxy. mutations on:
- **plain objects** (`session.user = {}; session.user.name = 'a'`) — tracked, flushed on dispatch end.
- **arrays** (`session.tags = []; session.tags.push('x')`, index assignment, splice, pop, ...) — tracked.

mutations on:
- **class instances** (`session.user = new User(); session.user.name = 'a'`) — **not tracked**. user-defined classes don't survive `JSON.stringify` round-trips through your storage backend, and `#private` fields throw through `Proxy`. work around by storing plain objects, or re-assign the whole field (`session.user = newUser`) to trigger flush.
- **builtins** (`Date`, `Map`, `Set`, `RegExp`, `Promise`, `ArrayBuffer`, ...) — **not tracked**, and proxying them would silently break internal-slot accesses like `Date.getTime()` or `Map.size`. store as primitives (`session.created_at = Date.now()`) or re-assign the whole field.

if you need to force a flush regardless, call `session.$forceUpdate()` mid-handler.

## behavior changes from v2

if you're moving from v2 with a serializing backend (redis, sql, anything that re-serializes session data on `get`/`set`), one important difference: **v3 mutates the underlying object directly through the proxy.** writes to `update.session.foo = 1` flow through to the same data object that `storage.set(key, data)` saves at end-of-dispatch.

v2 used a defensive entry-copy inside the proxy wrapper that made the proxy operate on a fresh internal target — separate from the object handed back to storage. with `MemoryStorage` this happened to work because `Map` preserves the proxy reference itself across `get`/`set`, but with any backend that JSON-roundtrips your session, **v2 silently dropped writes**. v3 makes writes observable everywhere, including outside the dispatch path: storing a session reference and reading it elsewhere observes live mutations.

if you depended on v2's accidental isolation (you shouldn't have), wrap session reads in a snapshot before passing them around: `const snap = JSON.parse(JSON.stringify(update.session))`.

## concurrency

session is per-update: each dispatched update gets its own `update.session` proxy backed by a fresh `storage.get` → wrap → `storage.set` cycle. v3's polling layer dispatches updates in a batch concurrently (per `polling.ts`), so two updates from the same key delivered in the same batch will race on `storage.get`/`set` — both load the same baseline, both write, last-writer-wins. this matches v2's behavior. for strict serialization use a custom `SessionStorage` with locking, or run polling with `batchSize: 1`.

documentation, examples, and a v2-to-v3 migration note will land alongside the v3 stable release. for now see `.claude/V3_DESIGN.md` (§7.7) in the repo for the architecture spec.
