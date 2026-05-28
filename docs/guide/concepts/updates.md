---
title: updates
description: the wrapped Update class — kind discriminant, raw payload, update.is() type predicate, and the class-per-kind model
---

# updates

an **update** (capital `U`) is everything telegram pushes at your bot — a new message, an edited message, a callback query press, an inline query, a poll-vote, a chat-member change, and so on. puregram wraps each one in a dedicated class codegen'd from the bot api schema

```ts
tg.onMessage((message) => {
  // wrapped accessor — camelCase, memoized
  console.log(message.text, message.from?.username)

  // raw bot-api payload — always available
  console.log(message.raw.message_id, message.raw.chat.id)

  return message.send('got it')
})
```

::: tip it's not a "context"
puregram uses the name `Update` for these objects, not `Context`. there is no `ctx` — the argument is the update itself
:::

## the kind discriminant

every update carries a `kind` string that identifies what it is. it is literal-typed, so TypeScript knows the exact class:

```ts
tg.onUpdate((update) => {
  console.log(update.kind) // e.g. "message", "callback_query", "poll"
})
```

## `update.is(kind)` — type predicate

`update.is(kind)` is a type guard. when it returns `true`, TypeScript narrows the update to the matching class:

```ts
tg.onUpdate((update) => {
  if (update.is('message')) {
    // narrowed to MessageUpdate — update.text, update.from, update.send(...) available
    return update.send(`echo: ${update.text}`)
  }

  if (update.is('callback_query')) {
    // narrowed to CallbackQueryUpdate
    return update.answer({ text: 'got it' })
  }
})
```

## `update.raw`

every update exposes the original bot-api payload as `update.raw`. use it when you need a field that the wrapper doesn't (yet) expose, or when you want to pass the raw shape to a third-party library:

```ts
tg.onMessage((message) => {
  const raw = message.raw  // TelegramMessage — the exact shape the bot api sent
  console.log(raw.date, raw.forward_origin)
})
```

## the class-per-kind model

each update kind is its own class — `MessageUpdate`, `CallbackQueryUpdate`, `InlineQueryUpdate`, etc. they're all codegen'd from the bot api schema. the codegen attaches:

- **getters** for every field (`message.text`, `message.from`, `message.chat`)
- **per-kind shortcuts** as methods (`message.send(...)`, `message.edit(...)`, `message.delete()`, `callbackQuery.answer(...)`)
- **`update.is(kind)`** as a type predicate
- **`update.api`** as a shortcut to `tg.api` so you can call any bot api method directly from an update handler

## common update kinds

| kind | class | description |
| --- | --- | --- |
| `message` | `MessageUpdate` | new message in any chat |
| `edited_message` | `EditedMessageUpdate` | an existing message was edited |
| `channel_post` | `ChannelPostUpdate` | new post in a channel |
| `edited_channel_post` | `EditedChannelPostUpdate` | a channel post was edited |
| `callback_query` | `CallbackQueryUpdate` | inline keyboard button press |
| `inline_query` | `InlineQueryUpdate` | inline mode query |
| `chosen_inline_result` | `ChosenInlineResultUpdate` | user picked an inline result |
| `shipping_query` | `ShippingQueryUpdate` | shipping address provided for an invoice |
| `pre_checkout_query` | `PreCheckoutQueryUpdate` | final confirmation before a payment |
| `poll` | `PollUpdate` | poll state changed |
| `poll_answer` | `PollAnswerUpdate` | user answered a poll |
| `my_chat_member` | `MyChatMemberUpdate` | bot's own membership changed |
| `chat_member` | `ChatMemberUpdate` | a chat member's status changed |
| `chat_join_request` | `ChatJoinRequestUpdate` | join request in a private channel/group |
| `message_reaction` | `MessageReactionUpdate` | user reacted to a message |

there are ~50 kinds in total including service events (derived from `TelegramMessage` payloads like `new_chat_members`, `pinned_message`). the full map lives in `UpdateKindMap` in `@puregram/api`

## dispatcher shortcuts

every kind has a matching `tg.on<Kind>(handler)` on the `Telegram` class:

```ts
tg.onMessage((message) => { /* ... */ })
tg.onCallbackQuery((callbackQuery) => { /* ... */ })
tg.onInlineQuery((inlineQuery) => { /* ... */ })
tg.onChatMember((update) => { /* ... */ })

// catch-all for any update kind
tg.onUpdate((update) => { /* ... */ })
```

the dispatcher accepts an optional filter as the first argument — details are in the dispatch & filters guide

## see also

- [the three-layer api](/guide/concepts/three-layer-api) — how to call api methods from an update
- [shortcuts](/guide/concepts/shortcuts) — per-kind methods and the anchor concept
- [the Telegram client](/guide/concepts/the-telegram-client) — registering update handlers
