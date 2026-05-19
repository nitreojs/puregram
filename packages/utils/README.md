<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#list-of-utilities'><b>list of utilities</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/pureforum'><b>telegram forum</b></a>
</div>

## @puregram/utils

_a small grab-bag of standalone helpers for `puregram` package_

### introduction

`puregram` core stays lean — anything that's useful but not essential lives out here. right now that's exactly two things: a slot-machine dice decoder, and a telegram web app `initData` validator. zero plugin glue, no `Telegram` instance required, both work as plain functions you can drop anywhere

### example

```ts
import { Telegram } from 'puregram'
import { getCasinoValues } from '@puregram/utils'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  if (message.hasDice() && message.dice.emoji === '🎰') {
    const [a, b, c] = getCasinoValues(message.dice.value)

    return message.send(`you got ${a}, ${b}, ${c}!`)
  }
})

await telegram.startPolling()
```

### installation

```sh
$ yarn add @puregram/utils
$ npm i -S @puregram/utils
```

---

<a name='list-of-utilities'></a>
## list of utilities

<a name='get-casino-values'></a>
### `getCasinoValues(source)` — slot machine dice decoder

when telegram delivers a 🎰 dice, `dice.value` is an integer in `1..64` that encodes the three symbols on the wheels. `getCasinoValues(value)` decodes it into the actual `[left, middle, right]` symbol triple

```ts
import { getCasinoValues, CasinoValue } from '@puregram/utils'

telegram.onMessage((message) => {
  if (!message.hasDice() || message.dice.emoji !== '🎰') {
    return
  }

  const symbols = getCasinoValues(message.dice.value)
  // → readonly [CasinoValue, CasinoValue, CasinoValue]

  if (symbols.every(s => s === CasinoValue.Seven)) {
    return message.send('🎉 jackpot — three sevens!')
  }

  return message.send(`you got ${symbols.join(', ')}`)
})
```

`source` accepts either a `number` or a numeric string. the return is a typed 3-tuple of `CasinoValue` — one of:

| `CasinoValue` member | string value |
|---|---|
| `CasinoValue.Bar` | `'bar'` |
| `CasinoValue.Grapes` | `'grapes'` |
| `CasinoValue.Lemon` | `'lemon'` |
| `CasinoValue.Seven` | `'seven'` |

<a name='web-app'></a>
### `WebApp` — telegram web app initData validation

when your bot opens a [web app](https://core.telegram.org/bots/webapps), the page receives an `initData` query string containing the user identity, auth date, and a `hash` that proves it came from telegram (signed with your bot token). before you trust *any* of those fields server-side, you have to verify the hash. that's what `WebApp` does

```ts
import { WebApp } from '@puregram/utils'

// the simple case — pass the bot token, get back true/false
const valid = WebApp.validate({
  initData: req.body.initData,
  token: process.env.TOKEN!
})

if (!valid) {
  res.status(401).end()
  return
}
```

#### `WebApp.generateSecretKey(token)` — derive the HMAC key once

`validate` does the same derivation internally on every call. for hot paths (validating per-request), derive once at boot and pass `key` instead — the HMAC step is the expensive part:

```ts
import { WebApp } from '@puregram/utils'

const KEY = WebApp.generateSecretKey(process.env.TOKEN!)

app.post('/api/me', (req, res) => {
  if (!WebApp.validate({ initData: req.body.initData, key: KEY })) {
    return res.status(401).end()
  }

  // safe to use req.body.initData fields now
})
```

returns a `Buffer`. cache it; re-deriving per request burns cpu for nothing

#### `WebApp.parseInitData(initData)` — split the query string into fields

```ts
import { WebApp } from '@puregram/utils'

const fields = WebApp.parseInitData('query_id=q&auth_date=1700000000&user=%7B%22id%22%3A1%7D&hash=abcd')
// → { query_id: 'q', auth_date: '1700000000', user: '{"id":1}', hash: 'abcd' }
```

useful when you want to inspect specific fields without going through `validate`.

**note**: don't trust the values until you've called `validate` — `parseInitData` is just a `URLSearchParams` shortcut

#### `WebApp.generateInitDataHash(initData, key)` — recompute the hash by hand

if you're rolling your own validation flow (caching, rate limiting, custom error reporting), use this to compute the expected hash and compare it yourself:

```ts
import { WebApp } from '@puregram/utils'

const KEY = WebApp.generateSecretKey(process.env.TOKEN!)
const expected = WebApp.generateInitDataHash(initData, KEY)
const actual = WebApp.parseInitData(initData).hash

if (expected !== actual) {
  // not from telegram, or initData was tampered with
}
```

#### `WebApp.validate(params)` — the full check

```ts
WebApp.validate({
  initData: '...',
  token: process.env.TOKEN!,    // OR…
  key: derivedKey,              // …pre-derived key (mutually exclusive)
  throwError: false             // default — return false on mismatch
})
```

| field | type | description |
|---|---|---|
| `initData` | `string` | the raw query string from `Telegram.WebApp.initData` (not `initDataUnsafe`) |
| `key` | `Buffer` | pre-derived HMAC key. mutually exclusive with `token` |
| `token` | `string` | bot token; derives the key on every call. supply `key` instead on hot paths |
| `throwError` | `boolean` | when `true`, throws on mismatch instead of returning `false`. default `false` |

returns `true` when the hash matches, `false` otherwise (or throws, with `throwError: true`). always throws synchronously when `initData` is missing the `hash` field — that's a malformed input, not a hash mismatch

---

<a name='parse-command'></a>
### `parseCommand(text)` — parse `/command[@bot] [args...]`

returns a structured breakdown of a telegram bot command string, or `null` when the input isn't a valid command

```ts
import { parseCommand } from '@puregram/utils'

parseCommand('/buy')
// → { command: 'buy', bot: undefined, args: [], rest: '' }

parseCommand('/buy@my_bot')
// → { command: 'buy', bot: 'my_bot', args: [], rest: '' }

parseCommand('/buy@my_bot apples 5 fresh')
// → { command: 'buy', bot: 'my_bot', args: ['apples', '5', 'fresh'], rest: 'apples 5 fresh' }

parseCommand('/buy@my_bot   foo')
// → { command: 'buy', bot: 'my_bot', args: ['foo'], rest: 'foo' }

parseCommand('/start ref_abc123_with_underscores')
// → { command: 'start', bot: undefined, args: ['ref_abc123_with_underscores'], rest: 'ref_abc123_with_underscores' }

parseCommand('hello')   // → null
parseCommand('/')       // → null (no command name)
parseCommand('  /buy')  // → null (telegram commands never have leading whitespace)
```

`args` is `rest.split(/\s+/).filter(Boolean)`; `rest` is everything after the command (and optional `@bot`) with leading whitespace trimmed. bot usernames are validated against the telegram rule `[a-zA-Z0-9_]{5,32}`

<a name='deep-link'></a>
### `deepLink(opts)` — build `https://t.me/<bot>?...` deep-links

generates t.me deep-links with proper `encodeURIComponent` escaping. supports every variant the bot api recognizes

```ts
import { deepLink } from '@puregram/utils'

deepLink({ bot: 'my_bot' })
// → 'https://t.me/my_bot'

deepLink({ bot: 'my_bot', start: 'ref_42' })
// → 'https://t.me/my_bot?start=ref_42'

deepLink({ bot: 'my_bot', startgroup: 'invite' })
// → 'https://t.me/my_bot?startgroup=invite'

deepLink({ bot: 'my_bot', startchannel: true, admin: ['post_messages', 'edit_messages'] })
// → 'https://t.me/my_bot?startchannel&admin=post_messages+edit_messages'

deepLink({ bot: 'my_bot', startapp: 'page_42' })
// → 'https://t.me/my_bot?startapp=page_42'

deepLink({ bot: 'my_bot', start: 'user@id 42' })
// → 'https://t.me/my_bot?start=user%40id%2042'
```

at most one of `start` / `startgroup` / `startchannel` / `startapp` should be supplied. when more than one is provided, the first one in that order wins and the others are silently ignored

---

## typescript usage

`@puregram/utils` ships its own `.d.ts`. the types you'll most likely import:

```ts
import type {
  CasinoValue,
  DeepLinkOpts,
  ParsedCommand,
  SlotMachineValue,
  WebAppValidateParams
} from '@puregram/utils'
```

- **`CasinoValue`** — string-literal union of the four slot-machine symbols
- **`SlotMachineValue`** — `readonly [CasinoValue, CasinoValue, CasinoValue]`, the return type of `getCasinoValues`
- **`WebAppValidateParams`** — params object shape for `WebApp.validate`
- **`ParsedCommand`** — return shape of `parseCommand`
- **`DeepLinkOpts`** — options shape for `deepLink`
