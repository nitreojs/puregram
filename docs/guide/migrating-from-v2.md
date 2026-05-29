---
title: migrating from v2
description: the v2 → v3 upgrade guide — what changed, what was dropped, and how to translate common patterns
---

# migrating from v2

v3 is a hard break. there is no compatibility layer, no codemod, and there will not be one. the api shape changed significantly enough that a one-to-one mechanical translation wouldn't be safe. that said, the concepts map cleanly once you know what moved where

## the clean break

v2 is frozen at `2.27.0` on the `lord` branch. npm tarballs for `puregram@2.x` stay published forever — existing installs don't break. once v3 ships, `lord` is overwritten with v3 and the repo becomes a v3 repo. packages dropped in v3 (`@puregram/hear`, `@puregram/prompt`) will have their source removed from the tree, but the published tarballs remain

## big renames

| v2 | v3 | notes |
|---|---|---|
| `Context` (base type + the thing handlers receive) | `Update` | "context" is gone as a concept. the wrapped update is an `Update` |
| `MessageContext` | `MessageUpdate` | every context class → matching `*Update` class |
| `telegram.updates.on('message', handler)` | `tg.onMessage(handler)` | per-kind dispatchers are first-class on `Telegram` |
| `telegram.updates.on('callback_query', handler)` | `tg.onCallbackQuery(handler)` | same pattern for every update kind |
| `telegram.updates.use(middleware)` | `tg.use(middleware)` | middleware is now on `Telegram` directly |
| `telegram.updates.startPolling()` | `tg.startPolling()` | polling is on `Telegram`, not `Updates` |
| `context.is('message')` | `update.is('message')` | same method, different class |
| `context.chatId` | `update.raw.chat.id` (or a shortcut) | anchors are codegen'd — see the three-layer api |
| `context.from` | `update.raw.from` | raw payload access is always `.raw.*` |

::: tip handlers still receive the update
the handler signature is the same shape: `tg.onMessage(async (m) => { ... })`. `m` is now a `MessageUpdate` instead of `MessageContext`, but the pattern is identical
:::

## reply shortcuts still exist

v2's `context.reply(text)` → v3's `message.reply(text)`. they work the same way:

```ts
// v2
telegram.updates.on('message', async (context) => {
  await context.reply('hello!')
  await context.replyWithPhoto(MediaSource.url('https://example.com/cat.jpg'))
})

// v3
tg.onMessage(async (message) => {
  await message.reply('hello!')
  await message.replyWithPhoto(MediaSource.url('https://example.com/cat.jpg'))
})
```

the full `reply*` family — `reply`, `replyWithPhoto`, `replyWithVideo`, `replyWithDocument`, etc. — is codegen'd onto every update kind that has a `chat_id` anchor

## dropped runtime dependencies

| v2 dep | gone because | v3 replacement |
|---|---|---|
| `middleware-io` | v3 has its own priority dispatch | `tg.use(mw)` / `tg.useHook(...)` built-in |
| `inspectable` + `reflect-metadata` + `experimentalDecorators` | runtime cost, forced decorator flags | `Symbol.for('nodejs.util.inspect.custom')` — codegen'd |
| `undici` | node 22 has native `fetch` | pluggable `HttpClient` (native fetch default) |
| `debug` | own logger with same interface | `PUREGRAM_DEBUG` env var, `puregram:*` namespaces |

## dropped packages

| v2 package | status | v3 path |
|---|---|---|
| `@puregram/hear` | gone | compose a `tg.command(...)` or `tg.onMessage(filter, handler)` — filter is userland |
| `@puregram/prompt` | gone | folded into [`@puregram/flow`](/plugins/flow/) as `flow.prompt(...)` |

`mergeMediaEvents` (a `Telegram` constructor option in v2) is gone as a core option. in v3, media group collection lives in `@puregram/flow` as `collectMediaGroup`

## plugin system

v2 had no plugin system — satellites were separate libraries you imported and wired up by hand. v3 has first-class plugins:

```ts
// v2 — import and wire manually
import { SessionManager } from '@puregram/session'
const session = new SessionManager(...)
telegram.updates.use(session.middleware)

// v3 — extend the Telegram instance
import { session } from '@puregram/session'
const tg = Telegram.fromToken(token)
  .extend(session())

// tg.session is now typed and available in every handler
tg.onMessage(async (m) => {
  m.session.count ??= 0
  m.session.count++
})
```

plugins namespace under their name (`update.flow`, `update.session`, `update.scene`). there is no `declare module 'puregram'` augmentation — the type follows from `.extend(plugin)`

## common pattern translation

| v2 pattern | v3 equivalent |
|---|---|
| `telegram.updates.on('message', h)` | `tg.onMessage(h)` |
| `telegram.updates.on(['message', 'edited_message'], h)` | `tg.onMessage(h); tg.onEditedMessage(h)` (or `tg.onUpdate(filter, h)`) |
| `context.reply('text')` | `message.reply('text')` |
| `context.send('text')` | `message.send('text')` |
| `context.replyWithPhoto(src)` | `message.replyWithPhoto(src)` |
| `telegram.api.sendMessage({ chat_id, text })` | `tg.api.sendMessage({ chat_id, text })` — same |
| `new TelegramMessage(payload)` wrapper | auto-wrapped as a `MessageUpdate` with `.raw` |
| `context.is('message')` type predicate | `update.is('message')` — same |
| `telegram.updates.use(mw)` middleware | `tg.use(mw)` — same concept |
| `telegram.api.sendMessage({ ..., suppress: true })` | `tg.api.sendMessage({ ..., suppress: true })` — same |

## module format

v2 was CJS — `require('puregram')` worked. v3 is ESM-only:

```ts
// v3 only — ESM
import { Telegram } from 'puregram'
```

if your project still uses CJS (`require`), you'll need to either:
- add `"type": "module"` to `package.json` and convert imports, or
- use a dynamic `import()` at your entry point

node 22+ is required

## what to do

1. read the [your first bot](/guide/getting-started/your-first-bot) page — the minimal v3 setup is a few lines
2. check the [three-layer api](/guide/concepts/three-layer-api) to understand where each kind of call lives
3. for sessions/scenes/flow — install the satellite packages and use `.extend(plugin)`. the READMEs in each `packages/<name>/` have quick-start examples
4. for anything genuinely unclear, [open an issue](https://github.com/puregram/puregram/issues)

## see also

- [introduction](/guide/getting-started/introduction) — what v3 is and why it exists
- [the three-layer api](/guide/concepts/three-layer-api) — `tg.api.X` vs `tg.send` vs `update.reply`
- [plugins & .extend](/guide/concepts/plugins) — how the plugin system works
