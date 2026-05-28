---
title: '@puregram/inline-message-id'
description: parse and serialize telegram inline_message_id strings — decode the TDLib blob to dc id, message id, owner id, and access hash
---

# `@puregram/inline-message-id`

every inline message your bot sends carries an `inline_message_id` — the opaque base64url-looking string you receive on `chosen_inline_result` and pass to `editMessageText`, `editMessageReplyMarkup`, etc. it's not actually opaque: it's a TL-serialized blob from TDLib's `inputBotInlineMessageID` / `inputBotInlineMessageID64`, with the data center, chat or owner id, message id, and access hash packed inside. `@puregram/inline-message-id` decodes it

zero `puregram` bindings, zero runtime deps. drop it into any node 22+ project — it's just a parser

## when to use

- inspecting which DC an inline message lives on (for routing or debugging)
- extracting the raw `messageId` or `ownerId` from the blob without going through the bot api
- building analytics over chosen inline results
- implementing a custom inline message id cache or lookup table

## install

::: code-group

```sh [yarn]
yarn add @puregram/inline-message-id
```

```sh [npm]
npm i -S @puregram/inline-message-id
```

```sh [pnpm]
pnpm add @puregram/inline-message-id
```

:::

## quick start

```ts
import { Telegram, InlineQueryResult, InputMessageContent, InlineKeyboard } from 'puregram'
import { InlineMessageId } from '@puregram/inline-message-id'

const DC_NAMES: Record<number, string> = {
  1: 'Miami, FL, USA',
  2: 'Amsterdam, NL',
  3: 'Miami, FL, USA',
  4: 'Amsterdam, NL',
  5: 'Singapore'
}

const tg = Telegram.fromToken(process.env.TOKEN!)

tg.onInlineQuery(q => q.answer({
  cache_time: 0,
  results: [
    InlineQueryResult.article({
      id: '1',
      title: 'send a tagged message',
      content: InputMessageContent.text('tap the button — i\'ll decode the inline_message_id'),
      reply_markup: InlineKeyboard.keyboard([
        InlineKeyboard.textButton({ text: 'ping', payload: 'ping' })
      ])
    })
  ]
}))

tg.onChosenInlineResult((u) => {
  const raw = u.raw.inline_message_id

  if (raw === undefined) {
    return
  }

  const id = InlineMessageId.from(raw)

  console.log(`dc ${id.dcId} (${DC_NAMES[id.dcId] ?? '?'}) — ${id.kind} form`)

  if (id.kind === 'legacy') {
    console.log(`  chat_id=${id.chatId}, message_id=${id.messageId}`)
  } else {
    console.log(`  owner_id=${id.ownerId}, message_id=${id.messageId}`)
  }
})

await tg.startPolling()
```

::: tip
`inline_message_id` is only present on `chosen_inline_result` when the inline result carries a `reply_markup`. telegram doesn't bother emitting it otherwise — check `raw.inline_message_id !== undefined` before parsing
:::

## the two wire shapes

telegram emits two flavours of `inline_message_id`, distinguished by their decoded byte length:

| length | TL type | `kind` |
|---|---|---|
| 20 bytes | `inputBotInlineMessageID` | `'legacy'` |
| 24 bytes | `inputBotInlineMessageID64` | `'modern'` |

**legacy (20 bytes)** — `dcId: int32`, `id: int64`, `accessHash: int64`. the middle `id` long packs the signed legacy chat id in its high 32 bits and the message id in its low 32 bits. produced by older clients and for chats whose ids still fit in int32

**modern (24 bytes)** — `dcId: int32`, `ownerId: int64`, `messageId: int32`, `accessHash: int64`. separate fields. produced for inline-bot-only messages and for chats whose owner id outgrew int32

::: warning
the legacy form's `chatId` is the **mtproto** chat id — a 32-bit signed integer. this is not the same as the bot api `chat.id` you receive on updates, which follows the `-100<peer_id>` format for groups and channels. don't compare them directly
:::

## core api

### `InlineMessageId.from(string)`

parses an `inline_message_id` string and returns an `InlineMessageId` instance. throws [`InlineMessageIdParseError`](#errors) on bad input

```ts
import { InlineMessageId } from '@puregram/inline-message-id'

const id = InlineMessageId.from('AgAAAH4AAAAtAQAAAAAAAA')

id.kind        // 'legacy' | 'modern'
id.dcId        // 1..5
id.accessHash  // bigint
id.messageId   // number — decoded from low 32 bits of `id` for legacy, direct field for modern
id.chatId      // number | undefined — legacy only (mtproto 32-bit chat id)
id.ownerId     // bigint | undefined — modern only
id.raw         // the discriminated ParsedInlineMessageId union
```

re-encode via `id.toString()` — it round-trips losslessly back to the original base64url string

### lower-level api

work directly with the discriminated union when you don't need the class wrapper:

```ts
import {
  parseInlineMessageId,
  serializeInlineMessageId,
  isLegacyInlineMessageId,
  isModernInlineMessageId
} from '@puregram/inline-message-id'

const parsed = parseInlineMessageId(raw)

if (isLegacyInlineMessageId(parsed)) {
  // narrowed to { kind: 'legacy', dcId, id, accessHash }
}

if (isModernInlineMessageId(parsed)) {
  // narrowed to { kind: 'modern', dcId, ownerId, messageId, accessHash }
}

const encoded = serializeInlineMessageId(parsed)
// round-trips back to the original base64url string
```

## errors

| class | thrown when |
|---|---|
| `InlineMessageIdParseError` | empty or non-string input, invalid base64url, decoded byte length is not 20 or 24 |

the error exposes `.input` (the offending string) for logging:

```ts
import { InlineMessageId, InlineMessageIdParseError } from '@puregram/inline-message-id'

try {
  InlineMessageId.from('garbage')
} catch (error) {
  if (error instanceof InlineMessageIdParseError) {
    console.error(`bad inline_message_id: ${error.message}`, error.input)
  }
}
```

## types

```ts
import type {
  ParsedInlineMessageId,
  LegacyInlineMessageId,
  ModernInlineMessageId
} from '@puregram/inline-message-id'
```

- **`ParsedInlineMessageId`** — `LegacyInlineMessageId | ModernInlineMessageId`
- **`LegacyInlineMessageId`** — `{ kind: 'legacy', dcId, id, accessHash }`
- **`ModernInlineMessageId`** — `{ kind: 'modern', dcId, ownerId, messageId, accessHash }`

## see also

- [file-id plugin](/plugins/file-id) — same TL-decode approach for `file_id` / `file_unique_id`
- [/api/methods](/api/methods) — `editMessageText`, `editMessageReplyMarkup`, etc. that accept `inline_message_id`
- [/api/objects](/api/objects) — `ChosenInlineResult` object that carries `inline_message_id`
