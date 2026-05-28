---
title: collectMediaGroup — @puregram/flow
description: buffer every message in a Telegram album and resolve with the full set in one call
---

# `collectMediaGroup`

when a user sends an album, telegram delivers each photo/video as a separate `message` update that shares the same `media_group_id`. without buffering, your handler fires once per item — you'd have to manage the sliding-window logic yourself

`collectMediaGroup` handles that for you: it buffers incoming messages by `media_group_id` and resolves once a window of inactivity passes

```ts
tg.onMessage(async (message) => {
  if (!message.hasMediaGroupId()) {
    return
  }

  const all = await message.flow.collectMediaGroup()

  await message.send(`got ${all.length} items in this album`)
})
```

resolves immediately with `[message]` when `media_group_id` is absent — safe to call defensively without the `hasMediaGroupId()` guard

## the lower-level form

`tg.flow.collectMediaGroup(message, options?)` takes the source message explicitly. use it when you have a `MessageUpdate` from somewhere other than the dispatcher:

```ts
const all = await tg.flow.collectMediaGroup(sourceMessage, { window: 500 })
```

## tuning the window

the window is **sliding** — every newly-arriving album item resets the timer. the default is `1000` ms

you can change it at two levels:

```ts
// plugin-level default — applies to every call without a per-call override
const tg = Telegram.fromToken(TOKEN)
  .extend(flow({ mediaGroupWindow: 2_000 }))

// per-call override
const all = await message.flow.collectMediaGroup({ window: 500 })
```

| option | type | default | description |
|---|---|---|---|
| `window` | `number` (ms) | plugin `mediaGroupWindow` (default `1000`) | inactivity window after the last album item before resolving |

::: tip choosing a window
larger windows tolerate slow telegram delivery; smaller windows resolve faster but risk truncating a late-arriving item. `1000` ms is fine for most deployments. raise it to `2000`–`3000` ms if you see albums arriving incomplete on slower connections
:::

## see also

- [@puregram/flow overview](/plugins/flow/) — install and plugin options
- [waiters](/plugins/flow/waiters) — `waitFor` for other use cases
