<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/puregram/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#api'><b>api</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/pureforum'><b>telegram forum</b></a>
</div>

## @puregram/inline-message-id

_parse and serialize telegram `inline_message_id` strings_

### introduction

every inline message your bot sends carries an `inline_message_id` — the opaque base64url-looking string you get on `chosen_inline_result` and pass to `editMessageText`, `editMessageReplyMarkup`, etc. it's not actually opaque: it's a TL-serialized blob from [TDLib](https://core.telegram.org/tdlib)'s `inputBotInlineMessageID` / `inputBotInlineMessageID64`, with the data center, chat or owner id, message id, and access hash packed inside. **`@puregram/inline-message-id` decodes it.**

zero `puregram` bindings, zero deps. drop it in any node 22+ project — it's just a parser

### example

a tiny inline bot that reports which dc and which user each chosen inline result lives on:

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

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onInlineQuery((q) => q.answer([
  InlineQueryResult.article({
    id: '1',
    title: 'send a tagged message',
    content: InputMessageContent.text('tap the button — i\'ll decode the inline_message_id'),
    // inline_message_id is only emitted when the result carries a reply markup
    replyMarkup: InlineKeyboard.keyboard([InlineKeyboard.textButton({ text: 'ping', payload: 'ping' })])
  })
], { cache_time: 0 }))

telegram.onChosenInlineResult((u) => {
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

await telegram.startPolling()
```

### installation

```sh
$ yarn add @puregram/inline-message-id
$ npm i -S @puregram/inline-message-id
```

requires node `>=22.0.0`

---

<a name='api'></a>
## api

### `InlineMessageId.from(string)` — parse an `inline_message_id`

```ts
import { InlineMessageId } from '@puregram/inline-message-id'

const id = InlineMessageId.from('AgAAAH4AAAAtAQAAAAAAAA')

id.kind        // 'legacy' | 'modern'
id.dcId        // 2
id.messageId   // 301
id.chatId      // 126        (legacy form only — `undefined` for modern)
id.ownerId     // undefined  (modern form only — `bigint`, `undefined` for legacy)
id.accessHash  // bigint
id.raw         // the discriminated parsed shape
```

re-encode via `id.toString()` — it round-trips losslessly back to the original base64url string.

### the two wire shapes

telegram emits two flavours of `inline_message_id`, distinguished by their decoded byte length:

| length | tl type                       | exposed kind |
|--------|-------------------------------|--------------|
| 20     | `inputBotInlineMessageID`     | `'legacy'`   |
| 24     | `inputBotInlineMessageID64`   | `'modern'`   |

**legacy (20 bytes)** packs the message info as `dcId: int32`, `id: int64`, `accessHash: int64`. the middle `id` long encodes the signed legacy chat id in its high 32 bits and the message id in its low 32 bits. produced by older clients and for chats whose ids still fit in int32

**modern (24 bytes)** splits the fields out: `dcId: int32`, `ownerId: int64`, `messageId: int32`, `accessHash: int64`. produced for inline-bot-only messages and for chats whose owner id outgrew int32

> **note** the legacy form's `chatId` is the **mtproto** chat id (32-bit, signed), not the bot api's `chat.id` you receive on updates — the bot api adds the `-100<peer_id>` prefix for groups/channels. don't compare these directly

### lower-level api

if you'd rather work with the discriminated union directly:

```ts
import { parseInlineMessageId, serializeInlineMessageId, isLegacyInlineMessageId } from '@puregram/inline-message-id'

const parsed = parseInlineMessageId(raw)

if (isLegacyInlineMessageId(parsed)) {
  // narrowed to { kind: 'legacy', dcId, id, accessHash }
}

const encoded = serializeInlineMessageId(parsed)
// round-trips back to the original base64url string
```

### errors

`parseInlineMessageId` and `InlineMessageId.from` throw `InlineMessageIdParseError` on:

- empty / non-string input
- input that isn't valid base64url
- decoded byte length other than 20 or 24

the error carries the offending `input` on the `.input` property for logging

```ts
import { InlineMessageIdParseError } from '@puregram/inline-message-id'

try {
  InlineMessageId.from('garbage')
} catch (error) {
  if (error instanceof InlineMessageIdParseError) {
    console.error(`bad inline_message_id: ${error.message}`, error.input)
  }
}
```

### typescript usage

```ts
import type {
  LegacyInlineMessageId,
  ModernInlineMessageId,
  ParsedInlineMessageId
} from '@puregram/inline-message-id'
```

- **`ParsedInlineMessageId`** — discriminated union of `LegacyInlineMessageId | ModernInlineMessageId`
- **`LegacyInlineMessageId`**, **`ModernInlineMessageId`** — the two per-form shapes
