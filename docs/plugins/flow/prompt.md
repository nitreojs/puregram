---
title: prompt — @puregram/flow
description: send a question and wait for the reply in one call — the ergonomic wrapper over waitFor
---

# prompt

`prompt` does three things atomically:

1. opens a `waitFor` scoped to that chat and the same sender
2. sends `text` to the chat
3. resolves with the matched reply (or `null` on timeout if `nullOnTimeout: true`)

the waiter is armed *before* the message goes out — `sendMessage` is a network round-trip and the transport keeps dispatching updates during it, so a reply that lands mid-send would otherwise sail past. if the send itself fails, the waiter is disarmed and `prompt` rejects with the send error

```ts
tg.command('signup', async (message) => {
  const reply = await message.flow.prompt("what's your name?", {
    timeout: 60_000,
    nullOnTimeout: true
  })

  if (reply === null) {
    return message.send('cancelled')
  }

  await message.send(`hi, ${reply.text}`)
})
```

## overriding the binding

by default `update.flow.prompt` pins to the same chat and the same sender. you can override either:

```ts
// "anyone in this chat can answer" — drop the sender pin
await message.flow.prompt('react below', { from: undefined })

// send the prompt to a different chat and wait for a reply there
await message.flow.prompt('reply over there', { chat: otherChatId })
```

::: tip
`from: undefined` set explicitly opts out of the sender pin. omitting `from` entirely keeps the default sender pin. the key has to be present in the options object to override
:::

## the lower-level form

`tg.flow.prompt(chatId, text, options?)` takes explicit chat and optional `from`:

```ts
await tg.flow.prompt(chatId, 'what is your name?', {
  from: userId,
  timeout: 60_000,
  nullOnTimeout: true
})
```

use this when you don't have an incoming update to bind to — webhook endpoints, scheduled outreach, or prompts triggered by an external event

## options

`prompt` extends `WaitForOptions` with three extra knobs:

| field | type | default | description |
|---|---|---|---|
| `kind` | `keyof UpdateKindMap` | `'message'` | which update kind closes this prompt. set to `'callback_query'` to wait for a button tap instead of a text reply |
| `from` | `number` | sender of the source update | restrict to replies from a specific user id. pass `undefined` explicitly on `update.flow.prompt` to accept any user |
| `reply_markup` | `InlineKeyboardMarkup \| ...` | none | keyboard attached to the outgoing prompt message |

all `WaitForOptions` fields also apply: `timeout`, `nullOnTimeout`, `consume`, `validate`, `transform`, `signal`, and (on `update.flow.prompt`) `match`

## chained multi-step prompts

each `prompt` call arms a fresh `waitFor` independently. answers from earlier prompts don't bleed into later ones:

```ts
tg.command('signup', async (message) => {
  const name = await message.flow.prompt('name?', {
    timeout: 60_000,
    nullOnTimeout: true
  })
  if (name === null) {
    return message.send('cancelled')
  }

  const age = await message.flow.prompt('age?', {
    timeout: 60_000,
    nullOnTimeout: true
  })
  if (age === null) {
    return message.send('cancelled')
  }

  const email = await message.flow.prompt('your email?', {
    timeout: 60_000,
    nullOnTimeout: true
  })
  if (email === null) {
    return message.send('cancelled')
  }

  await message.send(`registered: ${name.text}, ${age.text}, ${email.text}`)
})
```

::: tip in-memory only
chained prompts like the above live entirely in memory. if the bot restarts between steps, the conversation is lost. use persistent flows for anything that must survive a restart
:::

## waiting for a button tap

set `kind: 'callback_query'` to close the prompt on a button press instead of a text message:

```ts
await message.flow.prompt('confirm?', {
  kind: 'callback_query',
  reply_markup: {
    inline_keyboard: [[{ text: 'yes', callback_data: 'confirm:yes' }]]
  },
  timeout: 30_000,
  nullOnTimeout: true
})
```

## errors

`prompt` delegates to `waitFor` internally, so it throws the same errors:

| error class | thrown when |
|---|---|
| `WaitForTimeout` | `timeout` elapsed and `nullOnTimeout` is `false` |
| `WaitForCancelled` | `tg.flow.cancelAll()` was called |
| `WaiterAbortedError` | the `signal` option aborted |

## see also

- [waiters](/plugins/flow/waiters) — `waitFor` and its full options surface
- [persistent flows](/plugins/flow/persistent-flows) — restart-safe `prompt` backed by storage
- [@puregram/flow overview](/plugins/flow/) — install and quick start
