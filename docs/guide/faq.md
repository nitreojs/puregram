---
title: faq
description: frequently asked questions about puregram
---

# faq

## how do i enable debugging?

set the `PUREGRAM_DEBUG` environment variable before running your bot:

```sh
# everything
PUREGRAM_DEBUG='puregram:*' node bot.js

# just the api proxy and dispatch
PUREGRAM_DEBUG='puregram:api,puregram:dispatch' node bot.js
```

the full namespace list includes `puregram:api`, `puregram:dispatch`, `puregram:hooks`, `puregram:plugin`, `puregram:polling`, `puregram:webhook`, and a few more. logs go to `stderr`

full details on the debug page: [debugging](/guide/concepts/debugging)

## how do i migrate from v2?

by hand, honestly. the api shape changed a lot — `Context` is gone, dispatch moved from `telegram.updates.on(...)` to `tg.onMessage(...)`/`tg.onCallbackQuery(...)` etc, plugins are first-class via `.extend()`, and sessions/scenes/prompt all live in separate packages with redesigned apis

there's no codemod and there won't be one. the [migration guide](/guide/migrating-from-v2) has a full rename table and pattern translation

## what happens to v2?

v2 is frozen at `2.27.0` on the `lord` branch. the npm tarballs stay published forever — your existing `puregram@2.x` install isn't going anywhere. once v3 ships, `lord` gets overwritten with v3 and the repo becomes a v3 repo. packages that were dropped (`@puregram/hear`, `@puregram/prompt`) will have their source removed from the tree, but the published tarballs remain

## are there any telegram chats or channels?

yep. [t.me/pureforum](https://t.me/pureforum) is the chat. for "is this the right way to..." questions the chat is faster than opening an issue. for bugs and feature requests, [github issues](https://github.com/nitreojs/puregram/issues) is the right place

::: tip before you ask
check the examples in the repo first — `examples/` has runnable bots covering most common patterns. someone probably already solved your problem
:::

## why is your readme lowercased?

because i felt like it

- https://github.com/nitreojs/puregram/issues/63
- https://github.com/nitreojs/puregram/issues/62

## where's the api reference?

auto-generated from the pinned bot-api schema. the overview is at [/reference/api](/reference/api); raw method and object listings are at [/api/methods](/api/methods) and [/api/objects](/api/objects)

## why no `require()` support?

v3 is ESM-only. this was a deliberate choice — native `fetch`, top-level `await`, proper tree-shaking. node 22+ is required. if you're on CJS, add `"type": "module"` and convert — the [installation guide](/guide/getting-started/installation) covers the setup

## why is there no built-in command router?

puregram is a wrapper, not a framework. `tg.command('start', handler)` exists as a filter shortcut, but there's no scene manager, no FSM, no hear system in core. those live in opt-in satellite packages (`@puregram/scenes`, `@puregram/flow`, etc.) installed via `.extend(plugin)`. you only pull in what you need

## can i use this with bun / deno / cloudflare workers?

the web adapter (`webAdapter`) works anywhere that has the `Request`/`Response` web fetch API — bun, deno, cloudflare workers, and edge runtimes all qualify. for polling, node 22+ is the tested platform. bun should work since it supports most node apis — your mileage may vary

## see also

- [debugging](/guide/concepts/debugging)
- [migrating from v2](/guide/migrating-from-v2)
