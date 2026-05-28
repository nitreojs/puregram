---
title: error handling
description: ApiError, TelegramError, the suppress option, and tg.catch — how puregram surfaces and lets you handle failures
---

# error handling

puregram splits errors into two categories: **api errors** (the telegram bot api said no) and **dispatch errors** (your handler threw). each has its own surface

## api errors

`tg.api.X(...)` and `tg.send(...)` throw `ApiError` when telegram returns `ok: false`. `ApiError` extends `TelegramError` which extends `Error`:

```ts
import { ApiError } from 'puregram'

try {
  await tg.api.sendMessage({ chat_id: 1, text: 'hi' })
} catch (err) {
  if (err instanceof ApiError) {
    console.error(err.code)        // e.g. 403
    console.error(err.message)     // e.g. "Forbidden: bot was blocked by the user"
    // err.parameters?.retry_after       — flood-wait hint (seconds)
    // err.parameters?.migrate_to_chat_id — chat migrated to supergroup
  }
}
```

`TelegramError` is the base class. it carries `code: number` and `message: string`. `ApiError` adds `parameters?: TelegramResponseParameters` for the optional telegram response fields

## `suppress: true` — non-throwing form

pass `suppress: true` on any `tg.api.X` call to get the raw error response back instead of a throw. the return type becomes `T | ApiResponseError` — a typed conditional:

```ts
const result = await tg.api.sendMessage({
  chat_id: 1,
  text: 'hi',
  suppress: true
})

if (Telegram.isErrorResponse(result)) {
  // result is ApiResponseError — { ok: false, error_code, description }
  console.error(result.description)
} else {
  // result is TelegramMessage
}
```

`Telegram.isErrorResponse(value)` is the type guard. `suppress` works on every method of `tg.api` — it's a first-class part of the proxy type, not a workaround

::: warning don't swallow errors silently
`suppress: true` is for cases where failure is an expected outcome (e.g. checking if a user has started the bot). don't use it as a blanket "never throw" wrapper — silent failures are harder to debug than visible ones. if you need a fallback, use `try/catch` where the intent is clear
:::

::: tip suppress is not available on tg.api.call
`tg.api.call('method', params)` is the string-escape-hatch for methods not yet in the generated types. it always throws — there's no `suppress` equivalent on the untyped path
:::

## dispatch errors

errors thrown inside `tg.onMessage(...)` and other update handlers are dispatch errors. puregram's default: log via the debug logger and **rethrow on a microtask** so node's `uncaughtException` fires

register a catch handler to intercept them:

```ts
tg.catch((err, ctx) => {
  console.error('handler threw on update', ctx.raw.update_id, err)
})
```

multiple `catch` handlers can be registered — they all run in registration order. `ctx.raw` is the raw update payload

### `swallowDispatchErrors`

to suppress the microtask rethrow entirely — so only your `tg.catch` handlers see the error — pass `swallowDispatchErrors: true`:

```ts
const tg = new Telegram({
  token: process.env.TOKEN!,
  swallowDispatchErrors: true
})

tg.catch((err, ctx) => {
  // this is the only place dispatch errors land
})
```

::: warning swallowDispatchErrors without a catch handler drops errors
if `swallowDispatchErrors: true` and no `tg.catch` is registered, errors are silently swallowed — they won't appear anywhere. always register at least one catch handler when enabling this option
:::

## hook-level error handling

`tg.useHook('onError', fn)` intercepts errors at the api-request layer — between intercept and after-request hooks. it's lower-level than `tg.catch` and mostly useful for per-request retry or logging inside a plugin:

```ts
tg.useHook('onError', (error, context) => {
  // context.method — the api method name
  // context.params — the request params
  // returning here rethrows; return a replacement error to swap it
  return error
})
```

## see also

- [the three-layer api](/guide/concepts/three-layer-api) — where `tg.api.X` and `tg.send` live
- [debugging](/guide/concepts/debugging) — enable `PUREGRAM_DEBUG=puregram:api` to trace api calls and failures
