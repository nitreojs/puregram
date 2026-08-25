---
title: Telegram client
description: a grouped index of the public methods on the Telegram class — construction, api access, dispatch, plugins, lifecycle, webhook and file downloads
---

# Telegram client

`Telegram` is the main client class. this page is a flat index of its public surface — for narrative and options, follow the per-group links. construction details and the full options table live in [the Telegram client](/guide/concepts/the-telegram-client) guide

## construction

| member | description |
| --- | --- |
| `Telegram.fromToken(token, options?)` | preferred constructor — token plus optional overrides |
| `new Telegram(options)` | explicit constructor — full control over every option |
| `Telegram.isErrorResponse(value)` | static type guard for the `suppress: true` return shape |
| `tg.bot` | the bot's own `User`, populated after the first `start()` / `startPolling()` |

## api access

three layers, low to high — see [the three-layer api](/guide/concepts/three-layer-api)

| member | description |
| --- | --- |
| `tg.api.X(params)` | raw bot api call; returns the raw `Telegram*` result. `tg.api.call(method, params)` is the untyped escape hatch |
| `tg.send(args)` | curated top-level shortcut, plus the `sendPhoto` / `forward` / `copy` / `delete` / `pin` / `ban` / `react` family — see [shortcuts](/guide/concepts/shortcuts) |
| `tg.business(connectionId)` | a scoped `tg.api` copy that injects `business_connection_id` — see [acting as a business account](/guide/concepts/three-layer-api#acting-as-a-business-account) |
| `tg.ephemeral(receiverUserId, options?)` | a scoped `tg.api` copy bound to one ephemeral recipient; `options` is `{ callbackQueryId?, replaceCallbackQueryMessage? }` — see [sending an ephemeral message](/guide/concepts/three-layer-api#sending-an-ephemeral-message) |

## dispatch

register and remove update handlers — see [dispatch & filters](/guide/handling-updates/dispatch-and-filters)

| member | description |
| --- | --- |
| `tg.on<Kind>([filter,] handler)` | per-kind dispatcher (`tg.onMessage`, `tg.onCallbackQuery`, …) — one per [update kind](/api/updates) |
| `tg.onUpdate([filter,] handler)` | kind-agnostic handler, optionally gated by a filter |
| `tg.on(kind, handler, options?)` | register by kind string (service events, custom kinds) |
| `tg.onRawUpdate(handler)` | every raw update payload, before wrapping |
| `tg.command(trigger, handler)` | command filter shortcut (string or regex) |
| `tg.callbackQuery(trigger, handler)` | callback-query filter shortcut (string or regex) |
| `tg.off(kind, handler)` | remove a previously registered handler |
| `tg.catch(handler)` | intercept errors thrown inside handlers |

## middleware & hooks

| member | description |
| --- | --- |
| `tg.use([filter,] middleware, options?)` | add an update-level middleware — see [middlewares](/guide/handling-updates/middlewares) |
| `tg.useHook(name, fn, options?)` | attach a lifecycle / request hook — see [hooks](/guide/handling-updates/hooks) |

## plugins

extend the client — see [plugins & .extend](/guide/concepts/plugins)

| member | description |
| --- | --- |
| `tg.extend(plugin)` | install a plugin; its namespace is added to `tg` at runtime and in types |
| `tg.has(pluginName)` | check whether a plugin is installed |

## custom updates

register update kinds that telegram doesn't send — see [custom updates](/guide/concepts/custom-updates)

| member | description |
| --- | --- |
| `tg.defineUpdate(kind)` | declare a custom update kind |
| `tg.emit(kind, payload)` | dispatch a custom update through the pipeline |

## lifecycle & transport

| member | description |
| --- | --- |
| `tg.start()` | run init hooks and the start-time `getMe`, without starting a transport |
| `tg.shutdown()` | run cleanup callbacks and shutdown hooks |
| `tg.registerCleanup(fn)` | register a callback to run on `shutdown()` |
| `tg.startPolling(options?)` | start long polling — see [polling](/guide/deployment/polling) |
| `tg.stopPolling()` | stop the polling loop |
| `tg.startWebhook(options)` | start the built-in webhook listener — see [webhook](/guide/deployment/webhook) |
| `tg.webhookHandler(options?)` | a framework-agnostic webhook request handler |
| `tg.getWebhookCallback(options?)` | a `node:http`-style `(req, res)` callback |
| `tg.setWebhook(options)` / `tg.deleteWebhook(options?)` | manage the registered webhook |
| `tg.getWebhookInfo()` | fetch current webhook status |
| `tg.dropPendingUpdates(value?)` | clear queued updates |

## file downloads

resolve a file id / media object and pull its bytes

| member | description |
| --- | --- |
| `tg.download(target)` | download to a `Buffer` |
| `tg.downloadStream(target)` | download as a node `Readable` |
| `tg.downloadIterable(target)` | download as an async-iterable byte stream |
| `tg.downloadToFile(path, target)` | write the file to disk |
| `tg.getFileURL(target)` | resolve the temporary download url |

## see also

- [the Telegram client](/guide/concepts/the-telegram-client) — construction, options table, pluggable `HttpClient`
- [updates](/api/updates) — the wrapped update kinds the client dispatches
- [errors](/reference/errors) — what `tg.api.X` and `tg.send` throw
