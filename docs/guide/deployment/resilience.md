---
title: resilience
description: flood-wait retries, dispatch error handling, and concurrency control for production bots
---

# resilience

a handful of opt-in knobs that make your bot less fragile under real-world traffic and telegram's rate limits

## `retryOnFloodWait` — auto-retry on 429

when telegram responds with `429 Too Many Requests` it includes a `retry_after` value (seconds) saying how long to wait. `retryOnFloodWait` makes the api proxy honor that automatically — the same call sleeps and retries. defaults to `false` to preserve explicit error-handling behavior:

```ts
// one retry, no wait cap
const tg = new Telegram({
  token: process.env.TOKEN!,
  retryOnFloodWait: true
})

// bounded: up to 3 retries, but bail if telegram asks for more than 10s
const tg = new Telegram({
  token: process.env.TOKEN!,
  retryOnFloodWait: { max: 3, maxWaitMs: 10_000 }
})

// also retry 5xx + network errors with exponential backoff (3s, 6s, 12s, … capped at 1h)
const tg = new Telegram({
  token: process.env.TOKEN!,
  retryOnFloodWait: { max: 3, on: ['flood', 'server', 'network'], backoff: { base: 3000 } }
})
```

| field | type | default | description |
|---|---|---|---|
| `max` | `number` | `1` | max retries per call before propagating the `ApiError` |
| `maxWaitMs` | `number` | `Infinity` | if `retry_after × 1000` exceeds this, give up and throw instead |
| `on` | `RetryReason[]` | `['flood']` | which failures to retry — `'flood'` (429 + `retry_after`), `'server'` (api 5xx), `'network'` (transport/fetch errors) |
| `backoff` | `{ base?, max? }` | `{ base: 3000, max: 3_600_000 }` | exponential backoff for `server`/`network` retries — `base × 2 ** attempt`, capped at `max` (ms) |

::: tip what triggers a retry
with the default `on: ['flood']`, only `429` errors with a numeric `retry_after` in `parameters` trigger the sleep-and-retry path — every other error short-circuits as usual. add `'server'` / `'network'` to opt into 5xx and transport-failure retries (exponential `backoff`). calls with `suppress: true` keep their semantics (raw error object returned, no retry)
:::

## `tg.catch` + `swallowDispatchErrors`

`tg.catch(fn)` registers a handler for errors thrown inside dispatched update handlers. without one, puregram is loud by default: unhandled errors get rethrown on a microtask so node's `uncaughtException` fires. set `swallowDispatchErrors: true` and that fallback disappears — `tg.catch` handlers are the only escape hatch:

```ts
const tg = new Telegram({
  token: process.env.TOKEN!,
  swallowDispatchErrors: true
})

tg.catch((err, ctx) => {
  console.error('handler threw on update', ctx.raw.update_id, err)
})

tg.onMessage(async (m) => {
  await doRiskyThing(m)
  // any throw lands in tg.catch — no uncaughtException
})
```

multiple `tg.catch` handlers can be registered; they all run in registration order. `tg.catch` is a thin alias over `tg.useHook('onDispatchError', fn)`:

::: warning swallowing silently
`swallowDispatchErrors: true` without a `tg.catch` handler means errors disappear entirely. always pair them
:::

## polling concurrency + per-key sequentialization

`startPolling` defaults to dispatching every update in parallel. three options let you control this:

| option | type | default | description |
|---|---|---|---|
| `concurrency` | `number` | `Infinity` | cap on concurrent dispatches across the whole bot |
| `maxInFlight` | `number` | `Infinity` | stop pulling new updates while this many dispatches are in flight (running + queued); fetching resumes as they settle |
| `sequentializeBy` | `(raw) => string \| undefined` | `undefined` | return a key — updates sharing that key run in FIFO order; different keys still run in parallel (subject to `concurrency`) |

```ts
await tg.startPolling({
  // never run more than 8 handlers at once
  concurrency: 8,

  // and never let more than 64 updates pile up waiting for a slot
  maxInFlight: 64,

  // updates from the same chat run serially — safe when a handler reads/writes per-chat state
  sequentializeBy: raw =>
    String(raw.message?.chat.id ?? raw.callback_query?.message?.chat.id ?? '')
})
```

returning `undefined` or `''` from `sequentializeBy` opts that update out of per-key queuing — it runs in the global pool like any unkeyed update

::: tip why serial within a key?
if two updates from the same chat arrive simultaneously and both modify the same session entry, running them in parallel risks a lost write. serializing by chat id ensures each update sees the state left by the previous one. the tradeoff is latency per chat — tune `concurrency` to balance throughput
:::

::: tip concurrency vs maxInFlight
`concurrency` caps how many dispatches *run* at once; the rest queue in memory. under sustained overload that queue grows without bound. `maxInFlight` caps *running + queued* by pausing `getUpdates` once the limit is hit — telegram holds the backlog server-side until the bot catches up, so memory stays flat. use `concurrency` to protect downstream services, `maxInFlight` to protect the process itself
:::

## auto-answering + de-duplicating updates

two more constructor knobs for everyday operator hygiene, both off by default:

- **`autoAnswerCallbackQuery`** — if a `callback_query` handler finishes without calling `update.answer(...)`, puregram answers it for you so the client's loading spinner never hangs. pass `true` for an empty answer, or an object (`{ text, show_alert, … }`) for a default answer
- **`dedupeUpdates`** — drop updates whose `update_id` was seen recently (webhook retries, overlapping `getUpdates`). `true` keeps a window of the last 1000 ids; pass `{ max }` to size it

```ts
const tg = new Telegram({
  token: process.env.TOKEN!,
  autoAnswerCallbackQuery: true,        // or { text: 'done' }
  dedupeUpdates: true                   // or { max: 5000 }
})
```

## see also

- [error handling](/guide/concepts/error-handling) — `ApiError`, `suppress`, the error class hierarchy
- [polling](/guide/deployment/polling) — `startPolling` options, stopping
