---
title: dispatch & filters
description: registering update handlers with tg.onMessage / tg.on<Kind>, gating them with filters, writing custom predicates, and composing filters
---

# dispatch & filters

the dispatch system routes every incoming telegram update to the handlers that care about it. register a handler with `tg.onMessage(...)`, `tg.onCallbackQuery(...)`, or any other per-kind method, and it fires whenever that kind arrives

```ts
import { Telegram } from 'puregram'

const tg = Telegram.fromToken(process.env.TOKEN!)

tg.onMessage(message => message.send('got it'))

await tg.startPolling()
```

## per-kind dispatchers

every bot api update kind has a dedicated method on `Telegram` — generated from the schema and installed automatically at construction time:

```ts
tg.onMessage(handler)
tg.onEditedMessage(handler)
tg.onChannelPost(handler)
tg.onCallbackQuery(handler)
tg.onInlineQuery(handler)
tg.onChosenInlineResult(handler)
tg.onShippingQuery(handler)
tg.onPreCheckoutQuery(handler)
tg.onPoll(handler)
tg.onPollAnswer(handler)
tg.onMyChatMember(handler)
tg.onChatMember(handler)
tg.onChatJoinRequest(handler)
tg.onMessageReaction(handler)
// ...and all the rest
```

per-kind dispatchers give you a fully typed handler argument — `tg.onMessage` gives you `MessageUpdate`, `tg.onCallbackQuery` gives you `CallbackQueryUpdate`, and so on

## kind-agnostic dispatch with `tg.onUpdate`

when a handler spans multiple kinds, or when you want to apply a cross-kind predicate, use `tg.onUpdate`:

```ts
// bare form — fires for every update regardless of kind
tg.onUpdate((update) => {
  console.log('[any]', update.kind)
})
```

the filter form narrows the handler argument:

```ts
import { filters } from 'puregram'

tg.onUpdate(filters.hasText, (update) => {
  // update.text is narrowed to string here
  console.log(update.text)
})
```

## gating with filters

a **filter** is a named, composable, type-guarded predicate. pass one as the first argument to any `tg.on<Kind>` or `tg.onUpdate` call, and the handler's argument gets narrowed to whatever the filter promises:

```ts
import { filters } from 'puregram'

// handler fires only for messages that have a text field
tg.onMessage(filters.hasText, (message) => {
  // message.text is string, not string | undefined
  return message.send(`echo: ${message.text}`)
})
```

filters use a `kinds` metadata fast-path — the dispatcher skips evaluating the predicate when `update.kind` is outside the filter's declared domain. codegen'd `hasX` filters carry this metadata automatically

## built-in filters

`puregram` ships two layers of filters. both are re-exported from the top-level `filters` namespace:

```ts
import { filters } from 'puregram'
```

**codegen'd `hasX` presence filters** — one for every nullable field on every update kind:

| filter | narrows |
| --- | --- |
| `filters.hasText` | `{ text: string }` |
| `filters.hasCaption` | `{ caption: string }` |
| `filters.hasPhoto` | `{ photo: Photo }` |
| `filters.hasDocument` | `{ document: Document }` |
| `filters.hasVideo` | `{ video: Video }` |
| `filters.hasAudio` | `{ audio: Audio }` |
| `filters.hasVoice` | `{ voice: Voice }` |
| `filters.hasSticker` | `{ sticker: Sticker }` |
| `filters.hasLocation` | `{ location: Location }` |
| `filters.hasPoll` | `{ poll: Poll }` |
| `filters.hasAnimation` | `{ animation: Animation }` |

there are ~60 codegen'd filters in total — every nullable accessor on every update class gets one

**handcrafted filters** — richer logic not expressible as a simple presence check:

| filter | description |
| --- | --- |
| `filters.command('start')` | matches `/start`, `/start@bot`, `/start payload` |
| `filters.start()` | matches `/start` with optional deeplink payload |
| `filters.text('hello')` or `filters.text(/pattern/)` | exact text or regex match |
| `filters.caption('...')` or `filters.caption(/.../)` | same but on caption |
| `filters.regex(/pattern/)` | regex against text falling back to caption |
| `filters.startsWith('/')` | text or caption prefix |
| `filters.endsWith('!')` | text or caption suffix |
| `filters.contains('foo')` | text or caption substring |
| `filters.chat.private` | private chats only |
| `filters.chat.group` | groups only |
| `filters.chat.supergroup` | supergroups only |
| `filters.chat.channel` | channels only |
| `filters.chatId(123, 456)` | specific chat ids |
| `filters.from(userId)` | specific sender user id |
| `filters.fromBot` | sender is a bot |
| `filters.fromPremium` | sender has telegram premium |
| `filters.kindIn(['message', 'edited_message'])` | one of the listed kinds |

the `filters.chat` filter is also callable: `filters.chat('private')` is equivalent to `filters.chat.private`

## the `tg.command` and `tg.callbackQuery` shortcuts

two especially common patterns have top-level methods that wrap the filter internally:

```ts
// string form: matches /hello, /hello@bot, /hello args
tg.command('hello', message => message.send('hi!'))

// regex form: runs directly against message.text
tg.command(/^\/say(?:\s+(?<text>.+))?$/i, async (message) => {
  await message.send(message.match?.groups?.text ?? 'silence')
})

// callback query by data value
tg.callbackQuery('btn:confirm', async (query) => {
  await query.answer({ text: 'confirmed' })
})

// callback query by regex — match groups flow through to update.match
tg.callbackQuery(/^buy:(?<sku>.+)$/, async (query) => {
  await query.answer({ text: `bought ${query.match?.groups?.sku}` })
})
```

::: tip `update.match`
both `command` and `callbackQuery` attach the `RegExpMatchArray` as `update.match` so named groups are accessible inside the handler
:::

## combining filters

filters compose with `.and(...)`, `.or(...)`, `.not()` (chained) or with the free functions `and`, `or`, `not`:

```ts
import { filters, and } from 'puregram'

const { hasText, chat } = filters

// chained — both must match
tg.onMessage(hasText.and(chat.private), (message) => {
  return message.send(`private echo: ${message.text}`)
})

// factory form — equivalent
tg.onMessage(and(hasText, chat.private), (message) => {
  return message.send(`private echo: ${message.text}`)
})

// union — either must match
tg.onUpdate(filters.chat.group.or(filters.chat.supergroup), async (update, next) => {
  console.log('group or supergroup')
  await next()
})

// negation
tg.onMessage(filters.fromBot.not(), (message) => {
  // only from human users
  return message.send('hello human')
})
```

`and` intersects `kinds` metadata; `or` unions it; `not` clears it (negation may match outside the original kind set). the dispatcher propagates the fast-path either way

## writing custom filters

use `defineFilter` to create a reusable named filter:

```ts
import { defineFilter } from 'puregram'

const isWeekend = defineFilter(
  'isWeekend',          // name — shown in debug output
  (_update) => {
    const day = new Date().getDay()
    return day === 0 || day === 6
  }
  // no `kinds` → evaluates against any update
)

tg.onMessage(isWeekend, message => message.send('chill, it is the weekend'))
```

supply `kinds` metadata to unlock the dispatcher fast-path:

```ts
import { defineFilter } from 'puregram'

const fromAdmins = defineFilter(
  'fromAdmins',
  (update) => {
    const adminIds = new Set([100, 200, 300])
    return adminIds.has((update as { raw?: { from?: { id?: number } } }).raw?.from?.id ?? -1)
  },
  { kinds: ['message', 'edited_message', 'callback_query'] }
)
```

for async predicates — e.g. a database lookup — use `defineAsyncFilter`:

```ts
import { defineAsyncFilter } from 'puregram'

const isSubscribed = defineAsyncFilter(
  'isSubscribed',
  async (update) => {
    const userId = (update as { raw?: { from?: { id?: number } } }).raw?.from?.id
    return userId !== undefined && await db.isSubscribed(userId)
  },
  { kinds: ['message'] }
)

tg.onMessage(isSubscribed, message => message.send('subscriber content here'))
```

## raw update registration with `tg.on`

`tg.on(kind, handler)` registers a handler by kind string — useful for service events or custom update kinds:

```ts
// same as tg.onMessage(handler) but by string
tg.on('message', handler)

// custom update kind registered with tg.defineUpdate(...)
tg.on('my_event', (update) => { /* ... */ })
```

## handler signature

every handler is `(update, next) => unknown`. call `next()` to pass control to the next matching handler:

```ts
tg.onMessage(async (message, next) => {
  console.log('first handler')
  await next()            // continues to the next matching handler
  console.log('back from chain')
})

tg.onMessage(async (message) => {
  console.log('second handler')
  // not calling next() stops propagation here
})
```

## see also

- [updates](/guide/concepts/updates) — the Update class and kind discriminant
- [priority & propagation](/guide/handling-updates/priority-and-propagation) — how handlers at different priorities order
- [middlewares](/guide/handling-updates/middlewares) — cross-update middleware chain
- [service events](/guide/handling-updates/service-events) — message-derived event kinds
