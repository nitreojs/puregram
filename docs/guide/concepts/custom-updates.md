---
title: custom updates
description: register your own update kinds and emit them through puregram's dispatch pipeline alongside bot-api updates
---

# custom updates

puregram's dispatch pipeline isn't limited to updates that come from telegram. you can register your own update kinds — cron ticks, webhook callbacks from payment providers, internal job-completion signals — and emit them through the same `onUpdate` / `on<Kind>` chain that bot-api updates use

```ts
import { Telegram } from 'puregram'

type JobDone = { jobId: string, result: unknown }

const tg = Telegram.fromToken(process.env.TOKEN!)

tg.defineUpdate<'job_done', JobDone>('job_done')

setInterval(() => {
  tg.emit('job_done', { jobId: 'abc', result: { ok: true } })
}, 5000)

tg.onUpdate((update) => {
  if (update.kind === 'job_done') {
    console.log(update.jobId)   // string — typed
    console.log(update.result)  // unknown
  }
})
```

## the api

### `tg.defineUpdate<Name, Payload>(name)`

registers a new update kind. must be called before the first `emit` with that name — emitting an undeclared kind throws at runtime

the generic parameters set the kind's name and payload shape:

```ts
tg.defineUpdate<'payment_received', { amount: number, currency: string }>('payment_received')
```

### `tg.emit(name, payload)`

constructs a `CustomUpdate` from the registered kind and payload, then routes it through the dispatch pipeline. the payload fields are spread onto the update instance, so `update.amount` works directly — `update.raw.amount` also works if you prefer

::: tip emit is fire-and-forget
`tg.emit(...)` is synchronous — it queues the dispatch and returns `void`. errors thrown inside handlers are reported via the same `tg.catch` / `swallowDispatchErrors` path as bot-api update errors
:::

## the `CustomUpdate` class

a custom update carries:

| field | type | description |
| --- | --- | --- |
| `kind` | `string` (your name) | the update kind discriminant |
| `raw` | `Payload` | the original payload object |
| `...payload` | spread fields | each payload field is also a direct property |

`update.is(kind)` works the same as on bot-api updates — it's a type predicate. custom kinds don't match bot-api kind checks and vice versa

## registering a handler

custom updates flow through the same `onUpdate` path:

```ts
// cross-kind handler — sees everything
tg.onUpdate((update) => {
  if (update.kind === 'job_done') {
    // narrowed to CustomUpdate<'job_done', JobDone>
  }
})

// kind-specific handler
tg.on('job_done', (update) => {
  console.log(update.jobId)
})
```

`tg.on('job_done', handler)` is fully typechecked — `tg.on('not_a_real_kind', ...)` is a compile error for bot-api kinds (and a runtime throw for custom kinds that haven't been defined)

## when to use custom updates

custom updates are a good fit when:

- you have an external event source (payment provider webhook, cron job, message queue) and want a single dispatch entry point
- you're building a plugin that produces its own event kinds and wants handlers to use the same priority/middleware stack
- you need `tg.catch` and `swallowDispatchErrors` to cover non-telegram errors uniformly

for most cases a plain callback or event emitter is simpler. custom updates shine when the thing emitting events needs to be decoupled from the thing handling them, and you already have handlers registered on `tg`

## see also

- [plugins & .extend](/guide/concepts/plugins) — plugins are the main consumer of `defineUpdate` and `emit`
- [updates](/guide/concepts/updates) — the bot-api update side of the dispatch pipeline
