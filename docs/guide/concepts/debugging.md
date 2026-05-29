---
title: debugging
description: enable puregram's built-in debug namespaces via PUREGRAM_DEBUG, and inspect update objects with util.inspect
---

# debugging

puregram has its own namespaced logger — no `debug` package dependency, just a single env var. logs go to `stderr`

## `PUREGRAM_DEBUG`

set `PUREGRAM_DEBUG` to enable one or more namespaces:

```sh
# everything
PUREGRAM_DEBUG='puregram:*' node bot.js

# just api calls + dispatch events
PUREGRAM_DEBUG='puregram:api,puregram:dispatch' node bot.js

# just polling transport
PUREGRAM_DEBUG='puregram:polling' node bot.js
```

the env var is comma-separated. each entry is either an exact namespace or a wildcard prefix ending in `*`

### namespaces

| namespace | what it logs |
| --- | --- |
| `puregram:api` | every outbound api call (`-> sendMessage`) and its result — `<- sendMessage ok=true`, or `<- sendMessage ok=false error_code=400 description=...` on failure — plus 429 retry attempts |
| `puregram:api:raw` | full request params and the complete raw response body for every call (`-> getUpdates { ... }` / `<- getUpdates { ok: true, result: [ ... ] }`). noisy — paste this when something weird happens and the terse line isn't enough |
| `puregram:dispatch` | per-update kind routing and handler errors |
| `puregram:polling` | polling loop lifecycle events, including the underlying error on each retry |
| `puregram:webhook` | per-request webhook adapter events |

use `puregram:*` when you don't know which layer is misbehaving (it captures `puregram:api:raw` too), then narrow once you find the source

::: tip stderr only
all debug output goes to `stderr`. redirect with `2> debug.log` or pipe to a structured logger. stdout stays clean for your bot's own output
:::

## inspectable output

every update class and bot-api structure implements `Symbol.for('nodejs.util.inspect.custom')`. `console.log(update)` and `util.inspect(update)` print a readable, styled representation with camelCase field names instead of the raw snake_case payload:

```ts
tg.onMessage((message) => {
  console.log(message)
  // MessageUpdate { text: 'hello', chat: Chat { id: 100, ... }, from: User { ... }, ... }
})
```

the inspect output skips `raw`, `tg`, and `kind` — the things you don't usually need to see — and shows the class name so you always know what you're looking at

`util.inspect(update, { depth: 4, colors: true })` works as expected for deeper inspection. the depth option applies per-level the same way node's built-in types do

## in-code debug logging

if you're writing a plugin or a hook and want to tap into the same logger, `createDebug` is exported from the `puregram` internal surface (not the public api) — but the pattern is simple enough to reproduce inline:

```ts
// your own logger: just write to stderr
process.stderr.write(`[my-plugin] doing thing\n`)
```

for most users, `tg.useHook('onBeforeRequest', ctx => console.error('[req]', ctx.method))` is enough to trace api calls without any extra tooling

## see also

- [error handling](/guide/concepts/error-handling) — how api errors and dispatch errors surface
