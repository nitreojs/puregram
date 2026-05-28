---
title: keyboards
description: reply keyboards, inline keyboards, ForceReply, and RemoveKeyboard — building every Telegram reply_markup type
---

# keyboards

keyboards live in the `reply_markup` field of any send call. puregram ships four classes — `Keyboard`, `InlineKeyboard`, `RemoveKeyboard`, `ForceReply` — plus builder variants for incremental construction

```ts
import { Telegram, InlineKeyboard } from 'puregram'

const tg = Telegram.fromToken(process.env.TOKEN!)

tg.onMessage((message) => {
  const keyboard = InlineKeyboard.keyboard([
    [InlineKeyboard.text({ text: 'click me', payload: 'click' })]
  ])

  return message.send('pick one', { reply_markup: keyboard })
})
```

## Keyboard — reply keyboard

a `Keyboard` renders as the physical on-screen keyboard replacement shown to the user after the bot sends a message. buttons are plain text — pressing one sends that text as a message

### constructing with `Keyboard.keyboard(rows)`

pass a two-dimensional array of button strings or `TelegramKeyboardButton` objects:

```ts
import { Keyboard } from 'puregram'

const kb = Keyboard.keyboard([
  ['yes', 'no'],
  ['cancel']
])

message.send('choose:', { reply_markup: kb })
```

### chainable modifiers

| method | what it does |
|---|---|
| `.resize(true?)` | shrinks the keyboard to fit its rows |
| `.oneTime(true?)` | hides the keyboard after the user presses a button |
| `.selective(true?)` | shows the keyboard only to mentioned users |
| `.persistent(true?)` | always shows the keyboard even when the regular one is hidden |
| `.setPlaceholder(text)` | sets the input field placeholder while the keyboard is active |

```ts
const kb = Keyboard.keyboard([['yes', 'no']]).resize().oneTime()
```

### static button factories

| factory | what it does |
|---|---|
| `Keyboard.text(text, params?)` | plain text button |
| `Keyboard.textButton(text, params?)` | alias for `text` |
| `Keyboard.requestContact(text, params?)` | sends the user's phone number |
| `Keyboard.requestLocation(text, params?)` | sends the user's location |
| `Keyboard.requestUsers(text, params)` | opens a user-picker; sends `user_shared` |
| `Keyboard.requestChat(text, params)` | opens a chat-picker; sends `chat_shared` |
| `Keyboard.requestPoll(text, params?)` | asks the user to create a poll |
| `Keyboard.webApp(text, url, params?)` | opens a Mini App |

contact, location, user, chat, poll, and web-app buttons only work in private chats

```ts
const kb = Keyboard.keyboard([
  [Keyboard.requestContact('share phone')],
  [Keyboard.requestLocation('share location')]
]).resize()
```

### button styles

all factories accept an optional `params` with a `style` field (`'primary'`, `'danger'`, or `'success'`). this is a Telegram-bot-api extension supported on some clients:

```ts
import { ButtonStyle } from 'puregram'

Keyboard.text('confirm', { style: ButtonStyle.Primary })
Keyboard.text('delete', { style: 'danger' })
```

`ButtonStyle.Primary`, `ButtonStyle.Danger`, `ButtonStyle.Success` are typed constants — `'primary' | 'danger' | 'success'` are also accepted directly

### KeyboardBuilder — row-by-row builder

`KeyboardBuilder` is an alternative builder that accumulates buttons row-by-row. call `.row()` to commit the current row and start a new one:

```ts
import { KeyboardBuilder } from 'puregram'

const kb = new KeyboardBuilder()
  .textButton('yes')
  .textButton('no')
  .row()
  .textButton('cancel')
  .resize()
```

`KeyboardBuilder` has the same modifier methods as `Keyboard` and the same button factories as instance methods (not static). wide buttons — `requestContactButton`, `requestLocationButton`, `requestUsersButton`, `requestChatButton`, `requestPollButton`, `webAppButton` — automatically commit the current row before adding themselves

### `Keyboard.empty` / `Keyboard.remove()`

both are a `RemoveKeyboard` in disguise:

```ts
message.send('cleared', { reply_markup: Keyboard.empty })
message.send('cleared', { reply_markup: Keyboard.remove() })
```

## InlineKeyboard — inline buttons

an `InlineKeyboard` renders as buttons attached to the message itself (not a keyboard replacement). each button carries a payload: a callback, a url, a web app, etc.

### constructing with `InlineKeyboard.keyboard(rows)`

```ts
const kb = InlineKeyboard.keyboard([
  [
    InlineKeyboard.text({ text: 'a', payload: 'a' }),
    InlineKeyboard.text({ text: 'b', payload: 'b' })
  ],
  [InlineKeyboard.url({ text: 'open', url: 'https://example.com' })]
])
```

### static button factories

| factory | what it does |
|---|---|
| `InlineKeyboard.text({ text, payload })` | callback button — fires `callback_query` |
| `InlineKeyboard.url({ text, url })` | opens a url |
| `InlineKeyboard.webApp({ text, url })` | opens a Mini App in a Web App frame |
| `InlineKeyboard.login({ text, loginUrl })` | Telegram Login Widget button |
| `InlineKeyboard.switchToCurrentChat({ text, query })` | opens inline mode in this chat |
| `InlineKeyboard.switchToChat({ text, query })` | opens inline mode in a chosen chat |
| `InlineKeyboard.switchToChosenChat({ text, ... })` | opens inline mode in a filtered chat |
| `InlineKeyboard.copy({ text, copy })` | copies text to clipboard |
| `InlineKeyboard.game({ text, game })` | launches a game |
| `InlineKeyboard.pay({ text })` | pay button for invoices |

each factory also accepts `style` and `iconCustomEmojiId` inside the params object

```ts
// callback button
InlineKeyboard.text({ text: 'vote 👍', payload: 'vote:up' })

// url button
InlineKeyboard.url({ text: 'visit', url: 'https://example.com' })

// copy text to clipboard
InlineKeyboard.copy({ text: 'copy code', copy: 'DISCOUNT50' })

// login button
InlineKeyboard.login({ text: 'sign in', loginUrl: { url: 'https://auth.example.com' } })
```

::: tip callback_data validation
`payload` accepts `string | number`. values are validated at construction time: 1–64 bytes. passing an out-of-range string throws a `RangeError`
:::

### switch-to-chosen-chat

`switchToChosenChat` opens inline mode in a filtered chat (user, bot, group, or channel):

```ts
InlineKeyboard.switchToChosenChat({
  text: 'share in group',
  query: 'pre-filled',
  allowGroupChats: true
})
```

### InlineKeyboardBuilder — row-by-row builder

mirrors `InlineKeyboard` as a chainable builder. call `.row()` to commit the current row:

```ts
import { InlineKeyboardBuilder } from 'puregram'

const kb = new InlineKeyboardBuilder()
  .textButton({ text: 'a', payload: 'a' })
  .textButton({ text: 'b', payload: 'b' })
  .row()
  .urlButton({ text: 'open', url: 'https://example.com' })
```

`gameButton` and `payButton` on the builder are wide buttons — they auto-commit and start a new row

## RemoveKeyboard

removes the active reply keyboard:

```ts
import { RemoveKeyboard } from 'puregram'

message.send('keyboard removed', { reply_markup: new RemoveKeyboard() })

// or via Keyboard.empty / Keyboard.remove()
message.send('cleared', { reply_markup: Keyboard.empty })
```

`.selective(true)` limits removal to mentioned users

## ForceReply

forces the client to show a reply widget pre-addressed to the bot, as if the user manually hit "reply":

```ts
import { ForceReply } from 'puregram'

message.send('reply to this:', { reply_markup: new ForceReply() })
message.send('reply here:', { reply_markup: new ForceReply().setPlaceholder('type here…').selective() })
```

## see also

- [messages & media](/guide/telegram/messages-and-media) — sending messages to attach keyboards to
- [shortcuts](/guide/concepts/shortcuts) — per-kind shortcut anatomy
- [methods](/api/methods) — full generated method list
