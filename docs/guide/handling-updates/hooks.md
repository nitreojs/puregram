---
title: hooks
description: the request/lifecycle hook system — wrapping api calls with onBeforeRequest/onAfterRequest, lifecycle events via onInit/onShutdown, and how hooks differ from dispatch middlewares
---

# hooks

if [middlewares](/guide/handling-updates/middlewares) wrap incoming **updates**, hooks wrap outgoing **api requests** and the bot's lifecycle. every `tg.api.X(...)` call runs through a four-stage pipeline; each stage is a hook you can register middleware on

```ts
import type { RequestContext } from 'puregram'

// inject parse_mode: 'HTML' on every sendMessage call
tg.useHook('onBeforeRequest', (context: RequestContext, next) => {
  if (context.method === 'sendMessage' && context.params !== undefined) {
    context.params.parse_mode ??= 'HTML'
  }

  return next()
})
```

## `tg.useHook`

`tg.useHook(name, fn, options?)` is the single registration method for all hook types:

```ts
tg.useHook('onBeforeRequest', fn)      // request hook — Middleware<RequestContext>
tg.useHook('onAfterRequest', fn)       // request hook
tg.useHook('onUpdate', fn, options)    // dispatch middleware (same as tg.use)
tg.useHook('onInit', fn)               // lifecycle — runs after plugins install
tg.useHook('onShutdown', fn)           // lifecycle — runs on tg.shutdown()
tg.useHook('onError', fn)              // request-error hook
tg.useHook('onDispatchError', fn)      // dispatch-error hook (same as tg.catch)
```

## the request pipeline

every `tg.api.X(...)` call passes through four ordered stages. each is a named hook:

| stage | hook | `context` fields available | typical use |
| --- | --- | --- | --- |
| 1 | `onBeforeRequest` | `method`, `params` | mutate params, add default options, abort early |
| 2 | `onRequestIntercept` | `method`, `params`, `url`, `init` | swap http client, rewrite url |
| — | *(fetch happens here)* | — | — |
| 3 | `onResponseIntercept` | `method`, `params`, `url`, `init`, `response`, `json` | inspect or rewrite the response before puregram processes it |
| 4 | `onAfterRequest` | all fields | cleanup, metrics, cache updates |

all four hooks receive a `RequestContext` object. you can mutate it in place — the next stage in the pipeline sees the mutations:

```ts
import type { RequestContext } from 'puregram'

tg.useHook('onBeforeRequest', (ctx: RequestContext, next) => {
  // log every api call
  console.log('[api]', ctx.method, ctx.params)
  return next()
})

tg.useHook('onAfterRequest', (ctx: RequestContext, next) => {
  // log the response status
  console.log('[api done]', ctx.method, ctx.response?.status)
  return next()
})
```

## request context shape

```ts
import type { RequestContext } from 'puregram'

interface RequestContext {
  method: string                          // e.g. 'sendMessage'
  params: Record<string, unknown> | undefined
  url?: string                            // populated at onRequestIntercept
  init?: RequestInit                      // populated at onRequestIntercept
  response?: { status: number }           // populated at onResponseIntercept
  json?: unknown                          // parsed response body
}
```

## the error hook

`onError` fires between the request and the `onResponseIntercept` stage when a request fails. return a new `Error` to replace it, or return nothing/undefined to re-throw the original:

```ts
import type { ErrorHandler } from 'puregram'

const handler: ErrorHandler = (error, context) => {
  console.error(`api error on ${context.method}:`, error.message)
  // return a replacement error or nothing
}

tg.useHook('onError', handler)
```

## lifecycle hooks

two hooks fire at the bot's startup and shutdown:

**`onInit`** — runs once, after all plugins have installed and before dispatch starts. use it to spin up background tasks or validate configuration:

```ts
tg.useHook('onInit', async ({ tg }, next) => {
  console.log(`bot started as @${tg.bot.username}`)
  await next()
})
```

**`onShutdown`** — runs on `tg.shutdown()`, after polling stops but before in-flight updates finish draining. use it for graceful cleanup:

```ts
tg.useHook('onShutdown', async (_ctx, next) => {
  await db.close()
  await next()
})
```

lifecycle hooks don't support priority — they run in registration order

## dispatch hooks

`onUpdate` and `onDispatchError` are also managed via the hook system, but have dedicated shorthands:

- `tg.use(fn, options)` is shorthand for `tg.useHook('onUpdate', fn, options)` — see [middlewares](/guide/handling-updates/middlewares) for details
- `tg.catch(fn)` is shorthand for `tg.useHook('onDispatchError', fn)` — see [error handling](/guide/concepts/error-handling) for the dispatch-error contract

## priority on request hooks

request hooks (`onBeforeRequest`, `onRequestIntercept`, `onResponseIntercept`, `onAfterRequest`, `onUpdate`) support a `priority` option — `'high'`, `'normal'`, or `'low'`. within each priority level, handlers run in registration order:

```ts
// this request hook runs before any 'normal'-priority ones
tg.useHook('onBeforeRequest', async (ctx: RequestContext, next) => {
  ctx.params ??= {}
  ctx.params.parse_mode ??= 'HTML'
  await next()
}, { priority: 'high' })
```

## how hooks differ from dispatch middlewares

| | dispatch middlewares (`tg.use`) | request hooks (`useHook('onBefore...')`) |
| --- | --- | --- |
| **wraps** | incoming telegram updates | outgoing `tg.api.X(...)` calls |
| **arg type** | `AnyUpdate` | `RequestContext` |
| **registered with** | `tg.use(fn)` or `tg.useHook('onUpdate', fn)` | `tg.useHook('onBeforeRequest', fn)` etc |
| **typical use** | auth, rate-limit, session load, logging updates | inject default params, swap sources, log api calls, retry logic |

a plugin like [`@puregram/markup`](/plugins/markup/) uses `onBeforeRequest` to unwrap its tagged-template formatted text into `entities` before the api call goes out. [`@puregram/media-cacher`](/plugins/media-cacher) uses it to swap `MediaSource.path(...)` values for cached `file_id`s. these hooks fire at the api boundary — dispatch middleware never sees them

::: tip keep hooks and middlewares separate
hooks and middlewares serve different purposes and run at different points. a request hook that calls `tg.api.sendMessage` from inside `onBeforeRequest` will re-enter the hook pipeline — that's intentional, but be aware of it. dispatch middlewares run once per incoming update and never touch the outgoing request pipeline
:::

## see also

- [middlewares](/guide/handling-updates/middlewares) — the dispatch middleware chain
- [plugins & .extend](/guide/concepts/plugins) — plugins use hooks for their lifecycle integration
- [error handling](/guide/concepts/error-handling) — `onError` and `onDispatchError` in detail
