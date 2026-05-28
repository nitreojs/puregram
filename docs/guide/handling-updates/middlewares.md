---
title: middlewares
description: the dispatch middleware chain — registering tg.use() handlers, calling next(), ordering vs priority, and practical patterns like logging
---

# middlewares

a **middleware** is a function that runs before user handlers fire. it receives `(update, next)` — call `await next()` to pass control onward; don't call it to stop the chain. the classic tool for cross-cutting concerns: timing, logging, auth checks, rate-limit short-circuits, anything that has to wrap every handler

```ts
tg.use(async (update, next) => {
  const start = Date.now()
  await next()
  console.log(`${update.kind} took ${Date.now() - start}ms`)
})
```

## `tg.use`

`tg.use(fn, options?)` registers an `onUpdate` middleware. it's shorthand for `tg.useHook('onUpdate', fn, options)`:

```ts
tg.use(async (update, next) => {
  console.log('incoming:', update.kind)
  await next()
})
```

the filter form (`tg.use(filter, fn, options?)`) gates the middleware on a filter — the update is properly typed inside and the `kinds` fast-path applies so unrelated update kinds skip the predicate:

```ts
import { filters } from 'puregram'

tg.use(filters.chat.private, async (update, next) => {
  // update is narrowed — chat.type === 'private' is guaranteed
  console.log('[private]', update.kind)
  await next()
})
```

## middleware signature

```ts
import type { Middleware } from 'puregram'

const myMiddleware: Middleware<unknown> = async (update, next) => {
  // do something before
  await next()
  // do something after
}
```

`next` is `() => Promise<void>`. calling it forwards to the next middleware or user handler in the chain; not calling it stops propagation

## execution order

middlewares run in registration order within the same priority level. each layer wraps the rest like an onion:

```ts
tg.use(async (update, next) => {
  console.log('mw1 before')
  await next()
  console.log('mw1 after')
})

tg.use(async (update, next) => {
  console.log('mw2 before')
  await next()
  console.log('mw2 after')
})

tg.onMessage((message) => {
  console.log('handler')
  return message.send('ok')
})

// output for an incoming message:
// mw1 before
// mw2 before
// handler
// mw2 after
// mw1 after
```

## middlewares vs priority

`tg.use` defaults to `'normal'` priority. the full execution order for a single update is:

```
'high' middleware  →  'normal' middleware  →  [user tg.on<Kind> handlers]  →  'low' middleware
```

registering a middleware at `'high'` makes it run before all user handlers and all `'normal'` middleware:

```ts
// runs before every other handler — plugins like @puregram/flow use this for waitFor
tg.use(async (update, next) => {
  // intercept or augment here
  await next()
}, { priority: 'high' })
```

`'low'` middleware runs after all user handlers have had a chance to run — useful for cleanup or fallback responses

::: tip user handlers are not middleware
`tg.onMessage(handler)` registers a handler in the user-handler slot, not in the middleware chain. `tg.use(fn)` registers in the middleware chain (the `onUpdate` hook). both call `next()` to continue, but they live in separate slots — middleware at `'normal'` runs before the entire user-handler slot
:::

## example: logging middleware

```ts
tg.use(async (update, next) => {
  const start = Date.now()
  const id = (update as { raw?: { update_id?: number } }).raw?.update_id

  console.log(`→ ${update.kind} #${id}`)

  await next()

  console.log(`← ${update.kind} #${id} (${Date.now() - start}ms)`)
})
```

## example: early exit

not calling `next()` stops the chain — subsequent middleware and user handlers don't run:

```ts
import { filters } from 'puregram'

// block all bot messages
tg.use(filters.fromBot, async (_update) => {
  // swallow silently — no next() call
})
```

## example: filter-gated middleware

the 2-arg form of `tg.use` gives a typed update inside and skips evaluation for unrelated kinds:

```ts
import { filters } from 'puregram'

tg.use(filters.hasText.and(filters.chat.group), async (update, next) => {
  // update is narrowed to have text: string and be a group chat
  console.log(`group text: ${update.text}`)
  await next()
})
```

## registering via `tg.useHook`

`tg.use` is a convenience wrapper. the equivalent using `useHook` directly:

```ts
tg.useHook('onUpdate', async (update, next) => {
  await next()
})

// with priority
tg.useHook('onUpdate', async (update, next) => {
  await next()
}, { priority: 'high' })
```

this matters when you're writing a plugin that needs to register middleware programmatically — the full hook api is available the same way

## see also

- [dispatch & filters](/guide/handling-updates/dispatch-and-filters) — registering per-kind handlers and composing filters
- [priority & propagation](/guide/handling-updates/priority-and-propagation) — the three priority levels and how to stop propagation
- [hooks](/guide/handling-updates/hooks) — the api-request hook pipeline (different from dispatch middleware)
