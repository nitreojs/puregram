---
title: the Telegram client
description: constructing and configuring the Telegram class, lifecycle methods, and swapping the built-in http client
---

# the Telegram client

`Telegram` is the main entry point. it holds your bot token, owns the api proxy, manages transport (polling or webhook), and dispatches incoming updates

```ts
import { Telegram } from 'puregram'

const tg = Telegram.fromToken(process.env.TOKEN!)

tg.onMessage(message => message.send('hi!'))

await tg.startPolling()
```

## constructing the client

### `Telegram.fromToken(token, options?)`

the preferred way. reads sensible defaults and lets you override only what you need:

```ts
const tg = Telegram.fromToken(process.env.TOKEN!, {
  retryOnFloodWait: true
})
```

### `new Telegram(options)`

explicit form — useful when you need full control over every option or when constructing programmatically:

```ts
const tg = new Telegram({
  token: process.env.TOKEN!,
  apiBaseUrl: 'https://api.telegram.org/bot',
  apiTimeout: 30_000,
  apiRetryLimit: -1
})
```

## options reference

| option | type | default | description |
| --- | --- | --- | --- |
| `token` | `string` | — | bot token from @BotFather |
| `httpClient` | `HttpClient` | native `fetch` | pluggable http backend (see below) |
| `bot` | `TelegramUser` | — | pre-populate `tg.bot`, skip the start-time `getMe` call |
| `allowedUpdates` | `string[]` | `[]` (all) | update kinds to receive from telegram |
| `apiBaseUrl` | `string` | `https://api.telegram.org/bot` | api base url (local bot api, custom proxy) |
| `apiTimeout` | `number` | `30_000` | per-request timeout in ms |
| `apiWait` | `number` | `3000` | getUpdates long-poll window in ms |
| `apiRetryLimit` | `number` | `-1` (off) | max automatic retries per request |
| `apiHeaders` | `Record<string, string>` | `{}` | extra headers merged onto every request |
| `useTestDc` | `boolean` | `false` | route to the telegram test datacenter |
| `useLocal` | `boolean` | `false` | local bot api server mode |
| `defaultParams` | `DefaultParams` | `{}` | params merged into every outgoing call — `'*'` applies where valid, per-method overrides, call-site wins |
| `retryOnFloodWait` | `boolean \| RetryOnFloodWaitOptions` | `false` | auto-sleep and retry on 429 responses |
| `swallowDispatchErrors` | `boolean` | `false` | suppress unhandled dispatch errors reaching node's `uncaughtException` |

## default request params

`defaultParams` injects params into every outgoing api call so you stop repeating them at the call site. precedence is **call-site > per-method > `'*'`**, and object-valued params are replaced wholesale (never deep-merged):

```ts
const tg = Telegram.fromToken(process.env.TOKEN!, {
  defaultParams: {
    // '*' applies to any method that accepts the param
    '*': { parse_mode: 'HTML' },
    // per-method keys are typed to that method's params and override '*'
    sendMessage: { link_preview_options: { is_disabled: true } }
  }
})

// parse_mode: 'HTML' is added for you
await tg.send(chatId, '<b>bold</b>')

// the call site always wins
await tg.api.sendMessage({ chat_id: chatId, text: '*md*', parse_mode: 'MarkdownV2' })
```

a `'*'` default only lands on methods that actually accept the param — `'*': { parse_mode: 'HTML' }` never adds `parse_mode` to `sendDice`. it's set once on the client, with no runtime setter

## lifecycle

```ts
// long polling — starts the bot, calls getMe (populates tg.bot), then loops getUpdates
await tg.startPolling()

// stop polling gracefully
tg.stopPolling()

// webhook — starts the bot and optionally spins up a built-in node:http listener
await tg.startWebhook({ url: 'https://example.com/bot', port: 3000 })
```

`tg.startPolling()` accepts a `StartPollingOptions` object for fine-tuning the polling loop (allowed updates, timeout, limit). details are in the [polling deployment guide](/guide/deployment/polling)

`tg.bot` is populated after the first `startPolling()` (or `start()`) call via a `getMe` request. if you pass a `bot` option, the `getMe` call is skipped and `tg.bot` is pre-populated immediately

## pluggable `HttpClient`

the default transport uses node's native `fetch`. to swap it out — for testing, for proxying, or for a custom retry policy — implement the `HttpClient` interface:

```ts
import type { HttpClient, HttpRequestInput } from 'puregram'

const myClient: HttpClient = {
  async request (input: HttpRequestInput) {
    const response = await fetch(input.url, input.init)

    return {
      status: response.status,
      json: () => response.json()
    }
  },

  // optional — only needed if you use tg.download()
  async download (url, init) {
    const response = await fetch(url, init)

    return { status: response.status, body: response.body }
  }
}

const tg = Telegram.fromToken(process.env.TOKEN!, { httpClient: myClient })
```

the `request` method is required. `download` is optional — when omitted, `tg.download()` falls back to native `fetch`

::: tip token hygiene
never hardcode a bot token. read it from `process.env` (a `.env` file + `--env-file .env` in node 22 is enough) or from a secrets manager. anyone with the token controls the bot — treat it like a password
:::

## local bot api server

the [official local bot api server](https://github.com/tdlib/telegram-bot-api) speaks the exact same bot api as `api.telegram.org`, so puregram talks to it as a drop-in — point `apiBaseUrl` at it and flip `useLocal`:

```ts
const tg = new Telegram({
  token: process.env.TOKEN!,
  apiBaseUrl: 'http://localhost:8081/bot',
  useLocal: true
})
```

over the cloud api you get **2 GB** uploads/downloads (vs 50 MB / 20 MB), absolute on-disk `file_path`s, http webhooks on any port, far higher webhook concurrency, and no global rate limit. it's a deployment win for media-heavy or high-throughput bots — not a different feature set.

::: warning migrate once
before switching a live bot, call `logOut` against the cloud server once so updates route to your instance, then change `apiBaseUrl`. details in the [server readme](https://github.com/tdlib/telegram-bot-api).
:::

### downloads

in local mode the server hands back an absolute on-disk path as `file_path` instead of a download url. `useLocal: true` teaches `tg.download()` (and `downloadStream` / `downloadToFile` / `getFileURL`) to read straight off disk — no http round-trip:

```ts
const buffer = await tg.download(message.document)
```

### uploads — `MediaSource.local(path)`

the server can also read an *upload* off disk if you hand it a path, skipping the multipart upload entirely. that's what `MediaSource.local(...)` is for:

```ts
update.sendVideo(MediaSource.local('/srv/media/clip.mp4'))
```

`useLocal` and `MediaSource.local()` are **orthogonal**, by design:

- `useLocal` says *the api endpoint speaks the local protocol* — it changes url building and download semantics.
- `MediaSource.local()` says *this one file lives on a disk the server can read*.

they're kept separate because `useLocal: true` does **not** imply the bot and the server share a filesystem — they're often in different containers (no shared volume) or on different hosts. there the server can't see your paths, so a plain `MediaSource.path(...)` still uploads the bytes, exactly as it does against the cloud. puregram never silently turns `path` into a reference; you opt in per file with `local()`, which throws if used without `useLocal` (the cloud api rejects on-disk paths). prefer absolute paths — relative ones resolve against the bot process cwd.

## see also

- [your first bot](/guide/getting-started/your-first-bot) — minimal working example
- [updates](/guide/concepts/updates) — what the client dispatches
- [/api/methods](/api/methods) — the full generated method list
