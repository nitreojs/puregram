---
title: message extras
description: ReplyParameters (reply threading), LinkPreview (link card control), and Reaction (setMessageReaction) factories
---

# message extras

three small factories that cover the most common per-message extras: `ReplyParameters` for threading replies, `LinkPreview` for controlling the link card, and `Reaction` for emoji reactions

## ReplyParameters — reply threading

`ReplyParameters` builds the `reply_parameters` object accepted by every send method. the simplest form is a plain message id, but the factory gives you a named api for the full range of options

```ts
import { ReplyParameters } from 'puregram'

// reply to message 42 in the current chat
message.send('pong', { reply_parameters: ReplyParameters.to(42) })
```

### factories

| factory | what it builds |
|---|---|
| `ReplyParameters.to(messageId, params?)` | reply to a message in the current chat |
| `ReplyParameters.cross(chatId, messageId, params?)` | cross-chat reply — targets a message in a different chat |
| `ReplyParameters.quote(messageId, quote, params?)` | reply with a quoted excerpt from the original |

```ts
// reply without threading silently if the original is gone
message.send('pong', {
  reply_parameters: ReplyParameters.to(42, { allowSendingWithoutReply: true })
})

// cross-chat reply
tg.send(CHAT_ID, 'look at this', {
  reply_parameters: ReplyParameters.cross(OTHER_CHAT_ID, ORIGINAL_MESSAGE_ID)
})

// reply with a quoted excerpt
message.send('exactly this part', {
  reply_parameters: ReplyParameters.quote(messageId, 'the quoted text')
})
```

the `params` object (second or third argument) accepts camelCase equivalents of the `TelegramReplyParameters` fields:
- `allowSendingWithoutReply` — send anyway if the original is not found
- `quoteParseMode` — parse mode for the quote text
- `quoteEntities` — explicit entities for the quote
- `quotePosition` — character offset of the quote in the original

::: tip reply twins skip the factory
inside a handler, `message.reply(text)` and `message.replyWithPhoto(src)` already fill `reply_parameters` for you — no need to use `ReplyParameters.to(...)` in the common case. use `ReplyParameters` when you need cross-chat threading, quotes, or `allowSendingWithoutReply`
:::

## LinkPreview — link card options

`LinkPreview` builds the `link_preview_options` object accepted by `sendMessage`, `editMessageText`, and `InputMessageContent.text`

```ts
import { LinkPreview } from 'puregram'

// no preview at all
message.send('https://example.com', { link_preview_options: LinkPreview.disabled() })

// large card for a specific url
message.send('check this out', { link_preview_options: LinkPreview.large('https://example.com') })
```

### factories

| factory | what it builds |
|---|---|
| `LinkPreview.disabled()` | disables link preview entirely |
| `LinkPreview.url(url, params?)` | explicit preview url with no size preference |
| `LinkPreview.large(url, params?)` | explicit url, prefer the large-media variant |
| `LinkPreview.small(url, params?)` | explicit url, prefer the small-media variant |

the `url` factories tell telegram which url to preview when the message text contains multiple urls. the `params` object on `url` accepts `showAboveText` (bool) to position the preview above the message text

```ts
// pin the preview to a specific url in the text
message.send('see doc1.example.com and doc2.example.com', {
  link_preview_options: LinkPreview.url('doc1.example.com')
})

// put the preview above the text
message.send('video attached', {
  link_preview_options: LinkPreview.large('https://youtube.com/...', { showAboveText: true })
})

// small preview above the text
message.send('quick link', {
  link_preview_options: LinkPreview.small('https://example.com', { showAboveText: true })
})
```

## Reaction — emoji reactions

`Reaction` builds `ReactionType` objects for `tg.api.setMessageReaction` (or the `tg.react` shortcut)

```ts
import { Reaction } from 'puregram'

// react to message 42 with a thumbs-up
await tg.react(CHAT_ID, 42, [Reaction.emoji('👍')])

// remove all reactions (empty array)
await tg.react(CHAT_ID, 42, [])
```

### factories

| factory | what it builds |
|---|---|
| `Reaction.emoji(emoji)` | standard emoji reaction |
| `Reaction.customEmoji(id)` | custom-emoji reaction (premium) |
| `Reaction.paid()` | paid star reaction — cannot be set by bots |

```ts
// multiple reactions at once (some clients show multi-react)
await tg.react(CHAT_ID, messageId, [
  Reaction.emoji('🔥'),
  Reaction.emoji('👀')
])

// custom emoji reaction (premium feature)
await tg.react(CHAT_ID, messageId, [Reaction.customEmoji(customEmojiId)])
```

the underlying method is `tg.api.setMessageReaction({ chat_id, message_id, reaction, is_big? })`. `tg.react(chat, messageId, reactions, params?)` is the curated shortcut — pass extra params like `is_big: true` as the fourth argument:

```ts
await tg.react(CHAT_ID, messageId, [Reaction.emoji('❤')], { is_big: true })
```

::: tip listening for reactions
when a user adds or removes a reaction, telegram sends a `message_reaction` update. handle it with `tg.on('message_reaction', handler)`
:::

## see also

- [messages & media](/guide/telegram/messages-and-media) — sending messages and media
- [formatting text](/guide/telegram/formatting-text) — `parse_mode` and entities
- [methods](/api/methods) — full generated method list
