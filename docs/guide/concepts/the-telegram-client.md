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
| `retryOnFloodWait` | `boolean \| RetryOnFloodWaitOptions` | `false` | auto-sleep and retry on 429 responses |
| `swallowDispatchErrors` | `boolean` | `false` | suppress unhandled dispatch errors reaching node's `uncaughtException` |

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

## see also

- [your first bot](/guide/getting-started/your-first-bot) — minimal working example
- [updates](/guide/concepts/updates) — what the client dispatches
- [/api/methods](/api/methods) — the full generated method list
