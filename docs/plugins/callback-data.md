---
title: '@puregram/callback-data'
description: typed callback_data schemas with a compact binary encoder — define fields, pack buttons, filter with full type inference
---

# `@puregram/callback-data`

stop stuffing JSON into `callback_data`. you only get **64 bytes**. JSON eats them fast, and on the other end you have zero types and zero validation

`@puregram/callback-data` gives you a typed schema, a compact encoder (booleans = 1 bit, enums = `ceil(log2(N))` bits, integers = zigzag-varint), and a dispatch-ready filter that drops straight into `tg.onCallbackQuery(...)`. no manual parsing, no string-prefix routing, no `as`-casting back into shape

## when to use

whenever you attach `callback_data` to inline keyboard buttons and need to pack structured data into that 64-byte budget — ban/kick/mute with a user id, a pager with a current page, a settings toggle with a key + value. for static strings or single-key payloads without type needs, raw strings are fine

## install

::: code-group

```sh [yarn]
yarn add @puregram/callback-data
```

```sh [npm]
npm i -S @puregram/callback-data
```

```sh [pnpm]
pnpm add @puregram/callback-data
```

:::

## quick start

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
  // q.payload is { user_id: number } — typed, validated, no parsing
  return q.answer({ text: `banned ${q.payload.user_id}` })
})

await telegram.startPolling()
```

## core api

### `defineCallbackData(slug, options?)`

creates a new schema builder. chain `.string` / `.number` / `.boolean` / `.literal` to declare fields — each call returns a **new immutable** `CallbackData`, so storing intermediates is safe:

```ts
import { defineCallbackData } from '@puregram/callback-data'

const Action = defineCallbackData('action')
  .number('user_id')
  .literal('kind', ['ban', 'kick', 'mute'] as const)
  .boolean('confirm')
  .string('reason', { optional: true })
```

#### field types

| method | wire cost | ts type |
|---|---|---|
| `.string(key, opts?)` | 1 length byte + code units | `string` |
| `.number(key, opts?)` | 1–9 zigzag-varint bytes | `number` (signed safe integer) |
| `.boolean(key, opts?)` | 1 bit (in header bitmap) | `boolean` |
| `.literal(key, values, opts?)` | `ceil(log2(N))` bits (in header) | union of string literals |

#### field options

```ts
.number('count', { default: 0 })
.string('reason', { optional: true })
```

`optional` and `default` are mutually exclusive. `optional` fields are absent from the unpacked object when not present; `default` fields get the default value when omitted at pack time

### `schema.filter`

dispatch-ready filter — pass it to `tg.onCallbackQuery(schema.filter, handler)`:

```ts
telegram.onCallbackQuery(Ban.filter, (q) => {
  q.payload.user_id  // number
})
```

`q.payload` is the unpacked state, typed according to the schema. the filter only matches payloads that start with the correct slug and unpack without error

### `schema.button({ text, ...state })`

shorthand for building inline keyboard buttons:

```ts
// before:
const button = { text: 'Ban', callback_data: Ban.pack({ user_id: 1337 }) }

// after:
const button = Ban.button({ text: 'Ban', user_id: 1337 })
```

returns a plain `TelegramInlineKeyboardButton` — works wherever a button is expected

### `schema.pack(state)`

serialize a state object to a `callback_data` string. throws on invalid values or 64-byte overflow:

```ts
const data = Action.pack({ user_id: 1337, kind: 'ban', confirm: true })
```

### `schema.unpack(data)`

parse a `callback_data` string. returns `null` on any malformed input — wrong slug, truncated body, invalid literal index. never throws:

```ts
Action.unpack(data)
// { user_id: 1337, kind: 'ban', confirm: true }

Action.unpack('garbage')
// null
```

### `schema.validate(data)`

returns `true` if `data` matches this schema (and all `.with()` conditions). shorthand when you only need a boolean:

```ts
Action.validate(data)
// true
```

### `schema.repack(data, partial)`

unpack → merge → re-pack in one shot. handy for counter / pagination buttons:

```ts
const Pager = defineCallbackData('pager').number('page')

const next = Pager.repack(currentData, { page: currentPage + 1 })
```

throws `CallbackDataInvalid` if `data` doesn't match this schema

### `schema.with(conditions)`

narrow the filter with per-field conditions. returns a new `CallbackData` (immutable). matchers can be values, predicates, arrays of either, or the `present` / `missing` markers:

```ts
import { defineCallbackData, present, missing } from '@puregram/callback-data'

const Action = defineCallbackData('a')
  .number('user_id')
  .literal('kind', ['ban', 'kick', 'mute'] as const)
  .string('reason', { optional: true })

// exact value — narrows payload type
telegram.onCallbackQuery(Action.with({ kind: 'ban' }).filter, (q) => {
  q.payload.kind  // 'ban'
})

// array — match any
telegram.onCallbackQuery(Action.with({ kind: ['ban', 'kick'] }).filter, (q) => {
  q.payload.kind  // 'ban' | 'kick'
})

// predicate — runs at dispatch time
const ADMIN_IDS = new Set([1, 2, 3])
telegram.onCallbackQuery(Action.with({ user_id: id => !ADMIN_IDS.has(id) }).filter, handler)

// presence markers
telegram.onCallbackQuery(Action.with({ reason: present }).filter, (q) => {
  q.payload.reason  // string (not undefined)
})
telegram.onCallbackQuery(Action.with({ reason: missing }).filter, handler)
```

`.with(...)` chains — multiple calls AND together. `.filter` is a standard puregram `Filter`, so `.and` / `.or` / `.not` work:

```ts
telegram.onCallbackQuery(Ban.filter.or(Kick.filter), handler)
```

### slug and collision detection

the schema slug is the wire prefix on every packed payload — by default the first 6 chars of `base64url(md5(slug))`. customize with `slugLength`:

```ts
defineCallbackData('ban', { slugLength: 4 })
defineCallbackData('ban', { slugLength: 22 })
```

shorter = more byte budget, higher collision risk. the range is `[1, 22]`

for collision detection across all schemas, install the optional `callbackData` plugin. it throws on install if any two schemas hash to the same slug:

```ts
import { callbackData } from '@puregram/callback-data'

const tg = Telegram.fromToken(TOKEN)
  .extend(callbackData([Ban, Kick, Promote]))
```

the plugin also exposes `tg.callbackData.register(schema)` for adding schemas after install, and `tg.callbackData.all` (a `ReadonlyMap<slug, schema>`) for inspection

## wire format

after the slug prefix:

- **header**: booleans and literal indices bit-packed at 7 bits per ASCII byte — exact byte count is `ceil(headerBits / 7)`, deterministic from the schema
- **body**: strings as `[length byte][code units]`, numbers as zigzag-varint (base-64 over the high-bit-zero charset), in field-declaration order. optional fields contribute nothing when absent

booleans cost 1 bit, not 1 byte. small telegram user ids (< 127) fit in 2 bytes; even 13-digit chat ids fit in 8 bytes vs 14 as decimal strings

| schema | sample state | bytes |
|---|---|---|
| `{ id: number }` | `{ id: 1337 }` | 8 |
| `{ id: number }` | `{ id: 1234567890 }` | 11 |
| 7-boolean schema | all `true` | 7 |

## errors

| error | when |
|---|---|
| `CallbackDataTooLong` | `pack()` produces a payload > 64 utf-8 bytes |
| `CallbackDataInvalid` | `pack()` receives a value that fails field validation (missing required field, wrong type, non-safe integer, string > 127 code units); also thrown by `repack()` when the source doesn't match |
| `RangeError` | `slugLength` is outside `[1, 22]`; or `literal` field receives an empty values array |
| `Error` (slug collision) | thrown by `callbackData([...])` plugin at install when two schemas hash to the same slug |

```ts
import { CallbackDataTooLong, CallbackDataInvalid } from '@puregram/callback-data'
```

## typescript

`telegram.onCallbackQuery(schema.filter, handler)` types `handler`'s argument as the update narrowed to `{ payload: State }`. `.with(...)` narrows further based on value/array conditions:

```ts
const Ban = defineCallbackData('ban')
  .literal('kind', ['ban', 'kick'] as const)
  .number('user_id')

telegram.onCallbackQuery(Ban.with({ kind: 'ban' }).filter, (q) => {
  q.payload.kind     // 'ban' — narrowed from 'ban' | 'kick'
  q.payload.user_id  // number
})
```

predicate conditions don't narrow (ts can't infer from a runtime function), but value and array conditions do

## exported types

```ts
import type {
  Accepted,
  ButtonInput,
  CallbackData,
  CallbackDataExtension,
  CallbackDataOptions,
  FieldOptions,
  FieldSpec,
  FieldType
} from '@puregram/callback-data'
```

## see also

- keyboards — `button()` returns a `TelegramInlineKeyboardButton`; see the [keyboards guide](/guide/telegram/keyboards) for how to build inline keyboards
- [plugins & .extend](/guide/concepts/plugins) — how `.extend(plugin)` works
- [/api/methods](/api/methods) — `answerCallbackQuery` and related raw api methods
