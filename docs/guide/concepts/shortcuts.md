---
title: shortcuts
description: what a shortcut is, the anchor concept, and how curated per-kind helpers differ from raw tg.api.X
---

# shortcuts

a **shortcut** is a curated or codegen'd helper method that wraps a raw `tg.api.X` call and fills in one or more arguments automatically. shortcuts exist at two levels: on the `Telegram` client (`tg.send`, `tg.sendPhoto`, ...) and on each update class (`message.send`, `callbackQuery.answer`, ...)

```ts
// raw — you supply everything
await tg.api.sendMessage({ chat_id: 100, text: 'hi' })

// shortcut — chat is positional, chat_id is gone
await tg.send(100, 'hi')

// per-kind shortcut — chat_id comes from the update itself
tg.onMessage(message => message.send('hi'))
```

## the anchor concept

an **anchor** is a schema argument that a specific update kind can fill from its own payload. the most common anchor is `chat_id` — every message-bearing update has `update.raw.chat.id`, so every message shortcut can fill `chat_id` for you automatically

```ts
// without anchor: you carry the chat id around
tg.onMessage((message) => {
  const chatId = message.raw.chat.id
  return tg.api.sendMessage({ chat_id: chatId, text: 'response' })
})

// with anchor: message.send fills chat_id from message.raw.chat.id
tg.onMessage(message => message.send('response'))
```

some updates anchor more than one field. `callbackQuery.answer(...)` fills `callback_query_id` from `callbackQuery.raw.id`. `inlineQuery.answer(...)` fills `inline_query_id`. the generated update classes handle this per-kind

## shortcuts on `Telegram`

these live on the `Telegram` class and are available anywhere you have a `tg` reference. they take a positional `chat` argument (filling `chat_id`) and drop optional args you don't need:

```ts
// send a text message
await tg.send(chatId, 'hello')
await tg.send(chatId, 'hello', { parse_mode: 'HTML', disable_notification: true })

// send media
await tg.sendPhoto(chatId, MediaSource.path('./cat.png'))
await tg.sendDocument(chatId, MediaSource.url('https://example.com/file.pdf'), { caption: 'here' })
await tg.sendVideo(chatId, MediaSource.fileId('BQACAgI...'))

// forward, copy, delete
await tg.forward(fromChatId, toChatId, messageId)
await tg.copy(fromChatId, toChatId, messageId)
await tg.delete(chatId, messageId)
```

## per-kind shortcuts on update classes

these live on the generated update classes and are only available inside an update handler. they auto-fill the anchor from the update's payload:

```ts
tg.onMessage(async (message) => {
  // send to the same chat — chat_id auto-filled
  await message.send('got your message')

  // send with markup
  await message.sendPhoto(MediaSource.path('./photo.png'), { caption: 'here' })

  // delete this message
  await message.delete()

  // pin this message in the chat
  await message.pin()
})

tg.onCallbackQuery(async (callbackQuery) => {
  // answer the callback query — callback_query_id auto-filled
  await callbackQuery.answer({ text: 'done!' })

  // edit the message the button was on
  await callbackQuery.editText('updated text')
})

tg.onInlineQuery(async (inlineQuery) => {
  // answer — inline_query_id auto-filled
  await inlineQuery.answer({ results: [] })
})
```

## reply variants

on message-bearing kinds every `send`-family shortcut has a **reply twin** that fills one extra anchor — `reply_parameters.message_id` from the current message. `reply` mirrors `send` (text), and each `sendX` gets a `replyWithX`:

```ts
tg.onMessage(async (message) => {
  // a text reply to this message
  await message.reply('quoting you')

  // media replies — same args as sendPhoto / sendDocument, but as a reply
  await message.replyWithPhoto(MediaSource.path('./cat.png'), { caption: 'as a reply' })
  await message.replyWithDocument(MediaSource.url('https://example.com/file.pdf'))
})
```

the whole family is covered — `replyWithVideo`, `replyWithAudio`, `replyWithVoice`, `replyWithAnimation`, `replyWithVideoNote`, `replyWithSticker`, `replyWithMediaGroup`, `replyWithLocation`, `replyWithVenue`, `replyWithContact`, `replyWithPoll`, `replyWithDice`, ... — anything whose `tg.api.sendX` accepts `reply_parameters`

you can still pass `reply_parameters` yourself to quote, allow sending without a reply, or reply across chats — your fields merge over the injected `message_id` (and override it if you set your own):

```ts
import { ReplyParameters } from 'puregram'

tg.onMessage(message =>
  message.reply('with a quote', {
    reply_parameters: ReplyParameters.quote(message.messageId, 'why?')
  })
)
```

## `update.thread` — staying in a forum topic

forum-topic (and discussion-thread) messages carry a `message_thread_id`. to keep your replies in the same topic you'd otherwise repeat it on every call. `update.thread` is an opt-in namespace that mirrors every thread-capable shortcut and auto-fills `message_thread_id` for you — alongside the usual `chat_id`, and `reply_parameters.message_id` on the reply twins:

```ts
tg.onMessage(async (message) => {
  // both stay inside the topic this message came from
  await message.thread?.send('still in this topic')
  await message.thread?.sendPhoto(MediaSource.path('./photo.png'))

  // reply twins work here too
  await message.thread?.reply('threaded reply')

  // a typing indicator scoped to the topic
  await message.thread?.sendChatAction('typing')
})
```

`thread` is `undefined` when the message isn't in a thread — a normal group message, a channel post, the forum's *General* topic — so reach for it with `?.`. or narrow with `hasMessageThreadId()` to drop the `?.`:

```ts
tg.onMessage(async (message) => {
  if (message.hasMessageThreadId()) {
    await message.thread.send('no ?. needed past the guard')
  }
})
```

the namespace covers everything that accepts a `message_thread_id` — the `send` / `reply` families, `copy` / `forward`, and even forum-topic management like `editForumTopic` / `closeForumTopic` — all with the ids pre-filled

plain `update.send(...)` never threads on its own; it's deliberately hands-off. and because `thread` pins you to the *current* topic it doesn't take a `message_thread_id` of its own — to target a **different** thread, use the top-level shortcut where `message_thread_id` is just a param:

```ts
tg.onMessage(message =>
  message.send('over in another topic', { message_thread_id: 1234 })
)
```

## business connections

messages from a business account (the `business_message` / `edited_business_message` updates) carry a `business_connection_id`. it's anchored just like `chat_id` — every update shortcut that accepts it (`send`, `reply`, `edit*`, `pin`, `sendChatAction`, the `thread` namespace, …) fills it for you, so your reply goes back out on the same connection:

```ts
tg.onBusinessMessage(message => message.reply('handled on the business connection'))
```

it's filled only when the message actually has one, and it's dropped from the shortcut's params — so to act as the bot itself rather than the business account, drop to `tg.api`:

```ts
tg.onBusinessMessage(message =>
  tg.api.sendMessage({ chat_id: message.chat.id, text: 'from the bot, not the business' })
)
```

## `update.api` — the raw layer from inside a handler

every update also exposes `update.api`, which is a direct reference to `tg.api`. this gives you access to any raw method without needing to close over `tg`:

```ts
tg.onMessage(async (message) => {
  // same as tg.api.sendMessage(...)
  await message.api.sendMessage({ chat_id: message.chatId, text: 'via api' })
})
```

## how shortcuts differ from `tg.api.X`

| | `tg.api.X(params)` | `tg.send(chat, text, params?)` | `message.send(text, params?)` |
| --- | --- | --- | --- |
| argument style | named params object | positional `chat` + `text` | positional `text`, no `chat` |
| `chat_id` | you provide it | you provide it (as first arg) | auto-filled from update |
| available | everywhere | everywhere | only inside a handler |
| coverage | every method | common send methods | per-kind set |
| return type | raw `TelegramX` | raw `TelegramMessage` | raw `TelegramMessage` |

::: tip all roads lead to tg.api
every shortcut is ultimately a thin wrapper over `tg.api.X`. there is no magic — if a shortcut doesn't cover a parameter you need, you can always drop down to `tg.api.X` or pass the extra field via the trailing `params` object
:::

## see also

- [the three-layer api](/guide/concepts/three-layer-api) — the full picture with side-by-side examples
- [updates](/guide/concepts/updates) — the update classes that carry these shortcuts
