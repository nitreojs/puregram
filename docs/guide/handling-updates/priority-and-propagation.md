---
title: priority & propagation
description: the three dispatch priority levels — high, normal, low — how handlers are ordered, and how to stop propagation down the chain
---

# priority & propagation

every handler registered with `tg.onMessage`, `tg.onUpdate`, `tg.use`, or any other registration method carries a **priority** — one of `'high'`, `'normal'`, or `'low'`. the dispatcher sorts matched handlers by priority before running the chain, so high-priority handlers always run before normal-priority ones, which always run before low-priority ones

## priority levels

```ts
import type { Priority } from 'puregram'
// 'high' | 'normal' | 'low'
```

| level | default for | runs before |
| --- | --- | --- |
| `'high'` | plugins like [`@puregram/flow`](/plugins/flow/)'s `waitFor` | everything else |
| `'normal'` | all `tg.on<Kind>` and `tg.onUpdate` registrations | `tg.on<Kind>` handlers and `'low'` middleware |
| `'low'` | catch-all fallbacks | nothing |

the default for every registration method is `'normal'` unless you explicitly set it

## setting the priority

pass a `priority` option to any registration method:

```ts
// per-kind dispatcher
tg.onMessage(handler, { priority: 'high' })

// with a filter
tg.onMessage(filters.hasText, handler, { priority: 'low' })

// tg.onUpdate
tg.onUpdate(handler, { priority: 'high' })

// tg.on (string-based)
tg.on('message', handler, { priority: 'low' })

// middleware (tg.use)
tg.use(async (update, next) => {
  // ...
  await next()
}, { priority: 'high' })
```

## ordering within a priority level

within the same priority level, handlers run in **registration order** — the sequence counter increments every time you call `tg.on<Kind>` or `tg.onUpdate`, and the dispatcher breaks priority ties by that counter:

```ts
tg.onMessage((msg, next) => { console.log('first'); return next() })
tg.onMessage((msg, next) => { console.log('second'); return next() })
// output: "first" then "second"
```

## how the chain is built

when an update arrives, the dispatcher:

1. collects all registered entries whose kind or predicate matches the update
2. sorts the matched entries by priority rank (`high → normal → low`), then by registration sequence within each rank
3. runs the sorted entries as a middleware chain — each handler receives `next()` to call the next entry

middleware registered via `tg.use(fn, { priority: 'normal' })` runs **between** `'high'` middleware and user `tg.on<Kind>` handlers, since user handlers sit in their own implicit slot. the full onion stack for a single update looks like this:

```
onUpdate high  →  onUpdate normal  →  [user tg.on<Kind> handlers]  →  onUpdate low
```

user handlers (`tg.on<Kind>` and `tg.onUpdate`) all run in the same slot at `'normal'` — they are ordered among each other by their own priority option and registration sequence

## stopping propagation

**don't call `next()`** to stop the chain at the current handler:

```ts
tg.onMessage(filters.fromBot, async (message) => {
  // swallow updates from bots — nothing after this fires
  await message.send('no bots here')
  // intentionally no next() call
})

tg.onMessage(async (message) => {
  // never reached when the above handler matched
  await message.send('hello human')
})
```

::: tip next() is required to continue
if you forget `await next()` in a middleware that's supposed to be transparent, every handler registered after it goes silent. always explicitly decide whether to continue or stop
:::

calling `next()` after your own work has completed is also valid — useful for post-processing:

```ts
tg.onMessage(async (message, next) => {
  const start = Date.now()
  await next()  // let all handlers below run first
  console.log(`message chain took ${Date.now() - start}ms`)
})
```

## priority in practice

**`'high'`** — claim this for interceptors that must run before any user handler sees the update. the flow plugin's `waitFor` uses this so a `await waitFor('message')` call can pluck the next message out from under the regular dispatch chain before any `tg.onMessage(...)` handler fires:

```ts
tg.use(waitForMiddleware, { priority: 'high' })
```

**`'normal'`** — the default. most handlers live here

**`'low'`** — catch-all / fallback handlers that should only run when nothing above matched or chose to continue:

```ts
// default reply for anything not handled above
tg.onMessage(async (message) => {
  await message.send("i don't understand that command")
}, { priority: 'low' })
```

## see also

- [dispatch & filters](/guide/handling-updates/dispatch-and-filters) — registering handlers and composing filters
- [middlewares](/guide/handling-updates/middlewares) — the onUpdate middleware chain and how it interacts with priority
