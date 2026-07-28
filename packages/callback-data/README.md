<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/puregram/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#wire-format'><b>wire format</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#filtering-with-with'><b>filtering</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/pureforum'><b>telegram forum</b></a>
</div>

## @puregram/callback-data

_typed callback-data builder for `puregram` package_

### introduction

stop stuffing JSON into `callback_data`. you only get **64 bytes**, JSON eats them like a starving raccoon, and on the other end you have zero types and zero validation.

`@puregram/callback-data` gives you a typed schema, a tiny binary-ish encoder that beats decimal/JSON on every common case, and a callable filter that drops straight into `tg.on(...)`. no manual `JSON.parse`, no string-prefix routing, no `as`-casting back into shape

### example

```ts
import { Telegram } from 'puregram'
import { defineCallbackData } from '@puregram/callback-data'

const Ban = defineCallbackData('ban').number('user_id')

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((m) => {
  return m.send('this user is sus', {
    reply_markup: {
      inline_keyboard: [[Ban.button({ text: 'ban', user_id: m.senderId! })]]
    }
  })
})

telegram.onCallbackQuery(Ban.filter, (q) => {
  // q.payload: { user_id: number } — fully typed, validated, narrowed
  return q.answer({ text: `banned ${q.payload.user_id}` })
})

await telegram.startPolling()
```

`Ban.filter` is the dispatch-ready filter; pass it to `telegram.onCallbackQuery(...)` and the handler's update gets the unpacked `payload` attached. no separate `.handle()` middleware, no string-prefix routing

### installation

```sh
$ yarn add @puregram/callback-data
$ npm i -S @puregram/callback-data
```

---

## defining a schema

```ts
import { defineCallbackData } from '@puregram/callback-data'

const Action = defineCallbackData('action')
  .number('user_id')                                // signed safe integer
  .literal('kind', ['ban', 'kick', 'mute'] as const) // packs as ceil(log2(N)) bits
  .boolean('confirm')                                // packs as 1 bit
  .string('reason', { optional: true })              // utf-16, max 127 code units
```

each method returns a fresh `CallbackData` (immutable / chainable), so storing intermediate variables is safe

### field types

| method | wire cost | TS type |
|---|---|---|
| `.string(key, opts?)` | 1 length byte + N code units | `string` |
| `.number(key, opts?)` | 1-9 zigzag-varint bytes | `number` (signed safe integer only) |
| `.boolean(key, opts?)` | 1 bit (in header) | `boolean` |
| `.literal(key, [...] as const, opts?)` | `ceil(log2(N))` bits (in header) | union of literals |

`.literal(...)` values must be unique — duplicates would give one value two wire encodings, so they throw at schema-build time

### options

```ts
.number('count', { default: 0 })            // omitted at pack-time → uses default
.string('reason', { optional: true })       // omitted → field absent at unpack
```

`optional` and `default` are mutually exclusive — pick one

### slug + collision

the schema's slug becomes the wire prefix on every packed payload. by default it's the first 6 chars of `base64url(md5(slug))` — short, url-safe, deterministic, collision-resistant for ~hundreds of schemas. customize with `slugLength`:

```ts
defineCallbackData('ban', { slugLength: 4 })  // shorter prefix, slightly higher collision risk
defineCallbackData('ban', { slugLength: 22 }) // full md5, zero collision risk
```

want collision detection across all your schemas? install the optional plugin:

```ts
import { callbackData } from '@puregram/callback-data'

const tg = Telegram.fromToken(TOKEN).extend(callbackData([Ban, Kick, Promote]))
// throws on install if any two schemas hash to the same slug
```

---

## packing + unpacking

```ts
const data = Action.pack({ user_id: 1337, kind: 'ban', confirm: true })
// data: 'PreFix...' — 9-ish bytes total

Action.unpack(data)
// { user_id: 1337, kind: 'ban', confirm: true }

Action.unpack('garbage')
// null

Action.validate(data)
// true
```

`unpack` returns `null` on any malformed input — wrong slug, truncated body, invalid literal index, a number that decodes outside the safe-integer range. it never throws

`pack` throws on:
- missing required field with no default → `CallbackDataInvalid`
- wrong type (e.g. `'true'` for a boolean) → `CallbackDataInvalid`
- non-integer / non-safe number → `CallbackDataInvalid`
- string > 127 code units → `CallbackDataInvalid`
- string containing an unpaired surrogate — e.g. from a `text.slice(0, n)` that split an emoji → `CallbackDataInvalid`
- final payload > 64 bytes → `CallbackDataTooLong`

### `.button({ text, ...state })`

shortcut for inline buttons:

```ts
import { Telegram } from 'puregram'
import { defineCallbackData } from '@puregram/callback-data'

const Ban = defineCallbackData('ban').number('user_id')

// before:
const button = { text: 'Ban', callback_data: Ban.pack({ user_id: 1337 }) }

// after:
const button = Ban.button({ text: 'Ban', user_id: 1337 })
```

returns a plain `TelegramInlineKeyboardButton`; works anywhere a button is expected

### `.repack(data, partial)`

for counter / pagination / step-through buttons:

```ts
const Pager = defineCallbackData('pager').number('page')

const next = Pager.repack(currentData, { page: currentPage + 1 })
// unpacks → merges → re-packs in one shot
```

throws if `data` doesn't match this schema's slug

---

## filtering with `.with(...)`

`.with(...)` narrows the filter further. matchers can be values, predicates, arrays of either, or the `present`/`missing` markers:

```ts
import { defineCallbackData, present, missing } from '@puregram/callback-data'

const Action = defineCallbackData('a')
  .number('user_id')
  .literal('kind', ['ban', 'kick', 'mute'] as const)
  .string('reason', { optional: true })

const ADMIN_IDS = new Set([1, 2, 3])

// exact value
telegram.onCallbackQuery(Action.with({ kind: 'ban' }).filter, q => /* q.payload.kind: 'ban' */)

// array — match any
telegram.onCallbackQuery(Action.with({ kind: ['ban', 'kick'] }).filter, q => /* q.payload.kind: 'ban' | 'kick' */)

// predicate
telegram.onCallbackQuery(Action.with({ user_id: id => !ADMIN_IDS.has(id) }).filter, q => /* ... */)

// presence
telegram.onCallbackQuery(Action.with({ reason: present }).filter, q => /* q.payload.reason: string */)
telegram.onCallbackQuery(Action.with({ reason: missing }).filter, q => /* q.payload.reason: undefined */)
```

`.with(...)` chains — multiple calls AND together. each call returns a new `NarrowedCallbackData` (and its `.filter`) without mutating the original schema

a narrowed schema keeps `pack` / `unpack` / `validate` / `button` / `repack`, but no longer exposes `.string` / `.number` / `.boolean` / `.literal` — declare every field first, then narrow:

```ts
const Action = defineCallbackData('a').number('user_id').literal('kind', ['ban', 'kick'] as const)

const Ban = Action.with({ kind: 'ban' })   // ✅ narrow last
const Kick = Action.with({ kind: 'kick' }) // ✅ the base schema is untouched
```

### filter chain ops

`.filter` is a regular v3 `Filter`, so `.and` / `.or` / `.not` work like any other:

```ts
telegram.onCallbackQuery(Ban.filter.or(Kick.filter), handler)
```

---

## wire format

after the slug prefix:

- **header**: bit-packed presence + boolean values + literal indices, packed 7 bits per ASCII byte. exact size = `ceil(headerBits / 7)`, deterministic from the schema alone
- **body**: variable-length strings (`[length-byte][N code units]`) and varint numbers (zigzag, base-64 over the high-bit-zero charset, continuation bit at 0x40), in field-declaration order, only present fields contribute bytes

booleans cost 1 **bit**, not 1 byte. enums (literals) cost `ceil(log2(N))` bits. optional fields cost 1 presence bit + their normal cost when present. small numbers fit in 1-2 bytes; even 13-digit telegram chat IDs fit in 8 bytes vs 14 for decimal toString

### example sizes

| schema | sample state | bytes |
|---|---|---|
| `{ id: number }` | `{ id: 1337 }` | 8 |
| `{ id: number }` | `{ id: 1234567890 }` | 11 |
| 7-boolean schema | all `true` | 7 |
| `{ id: number, ban: bool, reason?: enum<8> }` | `{ id: 99, ban: true, reason: 'spam' }` | 9 |

---

## v2 → v3 migration

if you used `@puregram/callback-data@1.x`, the new API is mostly the same shape with these changes:

- `CallbackDataBuilder.create('ban')` still works (re-exported alias for `defineCallbackData`)
- `.handle(fn)` is **gone** — use `telegram.onCallbackQuery(BanPayload.filter, handler)` directly
- `.filter({...})` (the conditional method) is now `.with({...})` and returns a fresh schema (immutable). the new `.filter` property is the dispatch-ready `Filter` value
- `filters.exists()` is now `present` / `missing`
- handler receives `q.payload` (was `context.unpackedPayload`)
- wire format changed; old packed strings won't round-trip on the new schema (and slugs use `base64url` now, not `base64`)
- packed payload exceeding 64 bytes now throws `CallbackDataTooLong` at pack time instead of failing silently at telegram

---

## typescript

`telegram.onCallbackQuery(BanPayload.filter, handler)` types `handler`'s argument as `CallbackQueryUpdate & { payload: State }`. `.with(...)` further narrows `payload` based on the conditions:

```ts
const Ban = defineCallbackData('ban').literal('kind', ['ban', 'kick'] as const).number('user_id')

telegram.onCallbackQuery(Ban.with({ kind: 'ban' }).filter, (q) => {
  q.payload.kind     // 'ban' (not 'ban' | 'kick')
  q.payload.user_id  // number
})

telegram.onCallbackQuery(Ban.with({ kind: ['ban', 'kick'] }).filter, (q) => {
  q.payload.kind     // 'ban' | 'kick'
})
```

predicate-based conditions don't narrow (TS can't infer from a runtime function), but value/array conditions do

that's it. epic!!!
