---
title: polling
description: run your bot with long-polling — the simplest transport, great for development and small bots
---

# polling

`telegram.startPolling()` is the simplest way to run a bot. it long-polls `getUpdates`, dispatches each batch, and repeats. no public URL required, no TLS setup — just run the file and it works

```ts
import { Telegram } from 'puregram'

const tg = Telegram.fromToken(process.env.TOKEN!)

tg.onMessage(async (m) => {
  await m.reply('hello')
})

await tg.startPolling()
```

## `StartPollingOptions`

all fields are optional:

| field | type | default | description |
|---|---|---|---|
| `offset` | `number` | none | starting `update_id` for the next `getUpdates`. rarely needed — useful for resume-from-checkpoint flows |
| `timeout` | `number` (sec) | telegram's default | long-poll timeout passed to `getUpdates` |
| `allowedUpdates` | `string[]` | `tg.options.allowedUpdates` | restrict which update kinds telegram delivers. `[]` means "everything except opt-in kinds" |
| `dropPendingUpdates` | `boolean \| string[]` | `false` | drain the queued backlog before subscribing. `true` drops all; pass an array to drop only listed kinds |
| `concurrency` | `number` | `Infinity` | cap the number of concurrent dispatches |
| `sequentializeBy` | `(raw) => string \| undefined` | `undefined` | return a key to serialize dispatches per-key (FIFO within a key, parallel across keys) |

`allowedUpdates` can also be set at construction time — that value is the default for every subsequent `startPolling` or webhook call:

```ts
const tg = new Telegram({
  token: process.env.TOKEN!,
  allowedUpdates: ['message', 'callback_query']
})
```

a per-call `allowedUpdates` overrides the constructor default for that call only

## opting into every update kind

telegram's default `allowed_updates` excludes opt-in kinds like `chat_member`, `business_message`, and `chat_join_request`. to receive them you must list every desired kind explicitly. `UpdatesFilter` is a small helper that builds that list for you:

```ts
import { Telegram, UpdatesFilter } from 'puregram'

// subscribe to every update kind, including opt-in ones
const tg = new Telegram({
  token: process.env.TOKEN!,
  allowedUpdates: UpdatesFilter.all()
})

// every kind except a few
await tg.startPolling({
  allowedUpdates: UpdatesFilter.except(['business_connection', 'business_message'])
})

// single kind — no need to wrap it in an array
UpdatesFilter.except('chat_member')
```

| method | returns |
|---|---|
| `UpdatesFilter.all()` | `UpdateKind[]` — every known kind |
| `UpdatesFilter.except(kind)` | `UpdateKind[]` — every kind except the named one |
| `UpdatesFilter.except([...kinds])` | `UpdateKind[]` — every kind except the listed ones |

::: tip raw list
if you want the underlying constant: `import { UPDATE_KINDS } from 'puregram'` — readonly tuple of every update kind in dispatch order
:::

## stopping

```ts
tg.stopPolling()      // halts the poll loop; in-flight handlers keep running

await tg.shutdown()   // stops polling + fires onShutdown plugin hooks + drains in-flight handlers
```

for a graceful SIGTERM handler:

```ts
process.on('SIGTERM', async () => {
  await tg.shutdown()
})
```

::: warning one polling session at a time
calling `startPolling` twice on the same `Telegram` instance throws. telegram also returns `409` if two processes run `getUpdates` for the same token simultaneously — the loop detects this and stops itself
:::

## see also

- [webhook](/guide/deployment/webhook) — production transport with bring-your-own framework support
- [the telegram client](/guide/concepts/the-telegram-client) — constructor options, lifecycle, `shutdown`
- [resilience](/guide/deployment/resilience) — concurrency, flood-wait retries, error handling
