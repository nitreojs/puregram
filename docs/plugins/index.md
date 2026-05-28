---
title: plugins
description: opt-in satellite packages — flow, scenes, session, storage, markup, callback-data — installed via tg.extend(plugin)
---

# plugins

puregram core is a thin wrapper. everything beyond the bot api — state, wizards, formatting helpers, typed callback data — lives in opt-in **satellite packages** you install separately and attach with `tg.extend(plugin)` (see [plugins & .extend](/guide/concepts/plugins))

## state

- [session](/plugins/session) — per-user / per-chat state, auto-flushed on each update
- [storage](/plugins/storage) — the `KVStorage` contract + redis / sqlite adapters

## flows & wizards

- [flow](/plugins/flow/) — pause a handler and wait for the next update (`waitFor`, `prompt`, persistent flows)
- [scenes](/plugins/scenes) — multi-step wizards

## formatting & data

- [markup](/plugins/markup/) — entity-aware text formatting, no `parse_mode`
- [callback-data](/plugins/callback-data) — typed, packed `callback_data`
