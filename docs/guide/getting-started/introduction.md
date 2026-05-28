---
title: introduction
description: what puregram is, why it exists, and who it's for
---

# introduction

puregram is a thin, type-safe wrapper around the [telegram bot api](https://core.telegram.org/bots/api) for node.js. it's not a framework — you get api access, typed updates, and a plugin system; everything else is opt-in

## what telegram bots are

[telegram](https://t.me) lets you create [bot accounts](https://core.telegram.org/bots) that interact with users automatically — responding to messages, answering inline queries, handling callback presses, running payments flows, and more. bots can only be accessed via code; there is no human behind them

```ts
import { Telegram } from 'puregram'

const tg = Telegram.fromToken(process.env.TOKEN!)

tg.onMessage(message => message.send('hello!'))

await tg.startPolling()
```

that's the whole thing — create a client, register a handler, start polling

## what puregram is (and isn't)

**a wrapper, not a framework.** puregram gives you:

- typed access to every bot api method via `tg.api.X(params)`
- wrapped update classes generated from the bot api schema — `message.text`, `message.from`, `callbackQuery.data`
- a three-layer api: raw `tg.api.X`, curated `tg.send(...)`, and per-update shortcuts like `message.send(...)`
- a plugin system — `tg.extend(plugin)` adds behavior at both runtime and type level
- long-polling and webhook transports

**there is no built-in command router, scene manager, or fsm in core.** those live in opt-in satellite packages:

| need | package |
|---|---|
| persistent sessions | `@puregram/session` |
| multi-step wizards | `@puregram/scenes` |
| waitFor / prompt / persistent flows | `@puregram/flow` |
| tagged-template text formatting | `@puregram/markup` |
| typed callback-data payloads | `@puregram/callback-data` |

install any of them via `tg.extend(plugin)` — no config files, no magic

## why v3

v3 is a clean rewrite with a few hard constraints:

- **esm-only.** no cjs build. `"type": "module"` everywhere
- **node 22+.** native `fetch` instead of `undici` / `node-fetch`
- **zero core runtime deps.** the `puregram` package has no runtime dependencies. `@puregram/api` (the codegen'd types layer) has none either
- **classes generated off the bot api schema.** every update class, factory, and shortcut is generated from the pinned schema checkpoint in `@puregram/api`. no hand-maintaining 200 method signatures
- **type-safe plugins.** `tg.extend(plugin)` narrows `tg`'s type — `tg.session`, `tg.flow`, etc. are typed automatically. no `declare module 'puregram'` augmentations
- **priority dispatch.** handlers run at `'high'` / `'normal'` / `'low'` priority. plugins like `@puregram/flow` use this to intercept updates before your handlers see them

## who it's for

puregram v3 is for developers who:

- want full, typed access to the bot api without a framework telling them how to structure their bot
- write typescript and care about ide autocompletion on update fields and api params
- are building on node 22+ and have no need for a cjs build
- are migrating from v2 or starting fresh

::: tip not your first bot?
if you're coming from v2, the core concepts are the same but a lot of names changed — `Context` is `Update`, `telegram.updates.on` is `telegram.onMessage`, plugins are via `.extend()`. there is no compat layer. a migration guide will be available in the guide
:::

::: info esm requirement
puregram ships esm-only. if your project doesn't have `"type": "module"` in its `package.json` yet, you'll need to add it (or use `.mjs` extensions). see [installation](/guide/getting-started/installation) for the full setup
:::

## see also

- [installation](/guide/getting-started/installation) — get a token, install the package, configure esm
- [your first bot](/guide/getting-started/your-first-bot) — a minimal bot you can run in two minutes
