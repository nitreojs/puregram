---
title: your first bot
description: write, run, and understand a minimal puregram bot
---

# your first bot

here's the smallest bot you can write with puregram — it echoes every message back to the sender

## the code

create a file `bot.js` (or `bot.ts` if you're using typescript):

```ts
import { Telegram } from 'puregram'

const tg = Telegram.fromToken(process.env.TOKEN!)

tg.onMessage(message => message.send('hello!'))

await tg.startPolling()
```

## running it

pass your token as an environment variable:

```sh
TOKEN=your_token_here node bot.js
```

send your bot a message — it will reply with `hello!`

## what's happening

three lines do all the work:

**`Telegram.fromToken(process.env.TOKEN!)`** creates the client. it reads sensible defaults so you don't have to configure anything upfront. the `!` tells typescript the env var is present — in production, validate this before it reaches `fromToken`

**`tg.onMessage(message => message.send('hello!'))`** registers a handler for the `message` update kind. `message.send(...)` is a shortcut that fills in the `chat_id` from the incoming message automatically — you don't specify it

**`await tg.startPolling()`** starts long-polling `getUpdates`, dispatches each update through your handlers, and loops forever. it resolves only when you call `tg.stopPolling()`

::: tip what to do next
- swap `message.send('hello!')` for `message.send(message.text ?? '')` to build a real echo bot
- handle other update kinds: `tg.onCallbackQuery(...)`, `tg.onInlineQuery(...)`, `tg.onChatMember(...)`
- add a plugin: `tg.extend(session())` gives every handler a per-user session store
- explore more patterns in the [examples](https://github.com/puregram/puregram/tree/v3/examples)
:::

::: info typescript note
if you're using typescript, install `tsx` or compile with `tsc` first. `tsx` is the fastest path for development:

```sh
npx tsx bot.ts
```
:::

## see also

- [introduction](/guide/getting-started/introduction) — what puregram is and why it's built the way it is
- [installation](/guide/getting-started/installation) — token, package install, esm setup
- [api methods](/api/methods) — full reference for every bot api method
