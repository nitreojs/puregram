---
title: errors
description: the error classes puregram throws — TelegramError, ApiError, and the plugin install errors — with their fields and where each is raised
---

# errors

puregram throws a small, fixed set of error classes. this page is the signature reference — for how to catch them (`try/catch`, `suppress: true`, `tg.catch`), see [error handling](/guide/concepts/error-handling)

## `TelegramError`

the base class for every api-level failure. extends the native `Error`

```ts
class TelegramError extends Error {
  readonly code: number
  readonly cause?: unknown
  readonly message: string

  toJSON (): { name: string, code: number, message: string, cause?: unknown }
}
```

| member | type | description |
| --- | --- | --- |
| `code` | `number` | the bot api `error_code` (e.g. `403`, `429`) |
| `message` | `string` | the bot api `description` |
| `cause` | `unknown` | underlying cause, when one was attached |
| `name` | `string` | the concrete class name (set from `this.constructor.name`) |

## `ApiError`

thrown by `tg.api.X(...)` and `tg.send(...)` when telegram responds with `ok: false`. extends `TelegramError` with the optional response parameters

```ts
class ApiError extends TelegramError {
  readonly parameters?: TelegramResponseParameters
}
```

`parameters` carries the recoverable hints telegram sometimes returns — `retry_after` (flood-wait seconds) and `migrate_to_chat_id` (group upgraded to a supergroup)

## `ApiResponseError`

not a class — the raw error shape you get back instead of a throw when you pass `suppress: true`. narrow it with the `Telegram.isErrorResponse(value)` type guard

```ts
interface ApiResponseError {
  ok: false
  error_code: number
  description: string
  parameters?: TelegramResponseParameters
}
```

## plugin errors

raised while resolving plugin install order inside [`tg.extend(...)`](/guide/concepts/plugins). all three extend the native `Error`

| error | thrown when |
| --- | --- |
| `PluginConflict` | a plugin with the same `name` is already installed |
| `PluginCycle` | two or more plugins depend on each other in a cycle |
| `PluginMissingDep` | a plugin declares a `dependsOn` that was never registered |

## see also

- [error handling](/guide/concepts/error-handling) — catching, `suppress`, and `tg.catch`
- [plugins & .extend](/guide/concepts/plugins) — where the plugin errors originate
- [/api/methods](/api/methods) — the methods that throw `ApiError`
