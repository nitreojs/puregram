---
title: ai assistance
description: first-class agent skills for ai coding assistants working with puregram
---

# ai assistance

puregram ships first-class **agent skills** — structured knowledge files that ai coding assistants (claude code, codex, cursor, etc.) can load to get accurate, up-to-date information about the api

without them, assistants either hallucinate method signatures or fall back to outdated training data. with them, they know exactly what `tg.api.sendMessage` accepts, what `message.send` does, and how `tg.extend(plugin)` changes the type

## where skills live

the skills are in a separate repository from the main puregram package:

- **github:** [`github.com/puregram/skills`](https://github.com/puregram/skills)  
- **platform:** hosted on [skills.sh](https://skills.sh) — a registry for agent-installable skills

the split is intentional: skills track the package source and must stay in sync with it. when `@puregram/*` changes a public api, the matching skill is updated in the same release

## how to point your assistant at them

clone or download the skills repo, then point your assistant at the skill file for the package you're working with

**for claude code**, add the skill path to your project's `.claude/` config or reference it directly:

```sh
# point at the main puregram skill
node skills/using-puregram/tools/get-method.mjs sendMessage
node skills/using-puregram/tools/get-update.mjs message
node skills/using-puregram/tools/get-shortcut.mjs send
```

the skills repo ships **executable lookup tools** under `using-puregram/tools/` that resolve your installed `node_modules/@puregram/api` at runtime — so they always reflect the version you have installed, not a snapshot

::: tip lookup tools
```sh
node using-puregram/tools/get-method.mjs sendMessage     # method → params/return type
node using-puregram/tools/get-object.mjs Message         # object → fields
node using-puregram/tools/get-update.mjs message         # update class → helpers
node using-puregram/tools/get-shortcut.mjs send          # tg.send family → signatures
node using-puregram/tools/grep-source.mjs MessageShared  # grep across installed packages
```

each tool supports `--help` and most support `--list`
:::

## available skills

### main entry

**`using-puregram`** — start here. covers `Telegram.fromToken`, the three-layer api (`tg.api.X` / `tg.send` / `update.send`), `.extend(plugin)`, request hooks, dispatch middleware, `MediaSource`, keyboards, parse-mode, filters, errors, polling, and webhook

### per-plugin skills

| skill | covers |
|---|---|
| `puregram-flow` | `waitFor`, `prompt`, `collectMediaGroup`, `waitForAny`, persistent flows |
| `puregram-scenes` | multi-step wizards via `StepScene`, enter/leave/before/after step hooks |
| `puregram-session` | per-user / per-chat state, proxied auto-flush, `ttl`, `SessionData` |
| `puregram-storage` | the `KVStorage` / `TtlStorage` contract, `enhanceStorage` migrations |
| `puregram-callback-data` | typed `callback_data` via `defineCallbackData`, `.button`, `.filter`, `.with` |
| `puregram-testing` | actor-driven in-process test framework, vitest / mocha / node:test agnostic |
| `puregram-markup` | tagged-template entity-aware formatting; composes entities, no `parse_mode` needed |
| `puregram-media-cacher` | transparent `file_id` caching — first send uploads, subsequent sends reuse the id |
| `puregram-rate-limit` | inbound per-user fixed-window rate limiting |
| `puregram-throttler` | outbound sliding-window rate limiting — keeps your bot under telegram's soft limits |
| `puregram-file-id` | parse / inspect / serialize telegram `file_id` and `file_unique_id` strings |
| `puregram-inline-message-id` | TL parser for telegram's `inline_message_id` blob |
| `puregram-stream` | stream LLM output to telegram via animated message drafts |
| `puregram-utils` | slot-machine decoder, web app `initData` validation, deep-link helpers |

### cookbook

the skills repo also ships a [recipes reference](https://github.com/puregram/skills/blob/lord/using-puregram/reference/recipes.md) with canonical bot patterns

## staying in sync

skills **must stay in sync** with the package source. if a skill claims behavior the package doesn't support, the skill is wrong — not the package

if you notice drift (a skill describes an api that doesn't match what you see in source), file an issue at [`github.com/puregram/skills`](https://github.com/puregram/skills)

## see also

- [introduction](/guide/getting-started/introduction) — what puregram is and how it's structured
