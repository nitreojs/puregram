---
title: inline mode
description: answering inline queries with InlineQueryResult and InputMessageContent, inline query result types, and chosen inline result handling
---

# inline mode

inline mode lets users trigger your bot by typing `@yourbot …` in any chat. telegram sends an `inline_query` update; you answer with a list of results; the user picks one

```ts
import { InlineQueryResult, InputMessageContent } from 'puregram'

tg.on('inline_query', q => q.answer({
  results: [
    InlineQueryResult.article({
      id: '1',
      title: 'hello world',
      content: InputMessageContent.text('hello from the bot!')
    })
  ]
}))
```

::: tip enabling inline mode
turn on inline mode in @BotFather with `/setinline` before telegram will deliver `inline_query` updates to your bot
:::

## answering inline queries

the `inline_query` update exposes an `answer` shortcut that fills `inline_query_id` automatically:

```ts
tg.on('inline_query', async (query) => {
  await query.answer({
    results: [ /* InlineQueryResult entries */ ],
    cache_time: 300,       // seconds; defaults to 300
    is_personal: true,     // don't share results between users
    next_offset: '',       // pagination offset for the next page
    button: InlineQueryResult.button('open web app', {
      web_app: { url: 'https://example.com' }
    })
  })
})
```

the raw method is `tg.api.answerInlineQuery({ inline_query_id, results, ... })`. the shortcut is preferred inside handlers

`InlineQueryUpdate` also exposes:
- `query.id` — unique query id (the shortcut fills this)
- `query.from` — the sender (`User`)
- `query.query` — the search string typed by the user
- `query.offset` — pagination offset sent by the client
- `query.chatType` — optional; the chat kind the query came from
- `query.location` — optional sender location (bots that request location)

## InlineQueryResult

`InlineQueryResult` is a factory class with a static method per result type. `InlineQueryResultCached` (accessible as `InlineQueryResult.cached`) has the same set for cached file-id variants

### ergonomic differences from raw bot-api

three fields are renamed across all result types:

| bot-api field | `InlineQueryResult` param |
|---|---|
| `input_message_content` | `content` |
| `reply_markup` | `replyMarkup` |
| `thumbnail_url` + `thumbnail_width` + `thumbnail_height` + `thumbnail_mime_type` | `thumbnail: { url, width?, height?, mimeType? }` |

everything else is camelCased automatically

### result types

| factory | use case |
|---|---|
| `InlineQueryResult.article(params)` | link to a web page or arbitrary content body |
| `InlineQueryResult.audio(params)` | mp3 audio file |
| `InlineQueryResult.contact(params)` | contact card |
| `InlineQueryResult.document(params)` | generic file (pdf, zip) |
| `InlineQueryResult.game(params)` | game shortcut |
| `InlineQueryResult.gif(params)` | animated gif |
| `InlineQueryResult.location(params)` | location pin |
| `InlineQueryResult.mpeg4Gif(params)` | mpeg4 animation (silent video) |
| `InlineQueryResult.photo(params)` | photo |
| `InlineQueryResult.venue(params)` | venue |
| `InlineQueryResult.video(params)` | video or page with embedded player |
| `InlineQueryResult.voice(params)` | ogg/opus voice recording |

cached variants (`InlineQueryResult.cached.audio`, `.cached.document`, `.cached.gif`, `.cached.mpeg4Gif`, `.cached.photo`, `.cached.sticker`, `.cached.video`, `.cached.voice`) reference an existing file by id — no thumbnail needed

### result button

`InlineQueryResult.button(text, params?)` builds a `TelegramInlineQueryResultsButton` displayed above the result list:

```ts
query.answer({
  results: myResults,
  button: InlineQueryResult.button('search the web', {
    web_app: { url: 'https://example.com/search' }
  })
})
```

### examples

```ts
import { InlineQueryResult, InputMessageContent, InlineKeyboard } from 'puregram'

tg.on('inline_query', async (query) => {
  await query.answer({
    results: [
      // article — sends custom text when picked
      InlineQueryResult.article({
        id: '1',
        title: 'greeting',
        content: InputMessageContent.text('hello!'),
        thumbnail: { url: 'https://example.com/icon.png', width: 64, height: 64 }
      }),

      // article with inline keyboard attached
      InlineQueryResult.article({
        id: '2',
        title: 'with buttons',
        content: InputMessageContent.text('choose:'),
        replyMarkup: InlineKeyboard.keyboard([
          [InlineKeyboard.text({ text: 'yes', payload: 'yes' })]
        ])
      }),

      // photo from url
      InlineQueryResult.photo({
        id: '3',
        photoUrl: 'https://example.com/photo.jpg',
        thumbnail: { url: 'https://example.com/thumb.jpg' }
      }),

      // cached sticker by file id
      InlineQueryResult.cached.sticker({
        id: '4',
        stickerFileId: THE_STICKER_FILE_ID
      })
    ]
  })
})
```

## InputMessageContent

`InputMessageContent` builds the body of the message that gets sent when a user picks an inline result. the variants:

| factory | sends |
|---|---|
| `InputMessageContent.text(text, params?)` | text message |
| `InputMessageContent.location(lat, lng, params?)` | location pin |
| `InputMessageContent.venue(lat, lng, title, address, params?)` | venue |
| `InputMessageContent.contact(phoneNumber, firstName, params?)` | contact |
| `InputMessageContent.invoice(params)` | invoice (all fields required, takes the full param object) |
| `InputMessageContent.rich.md(markdown, params?)` / `.html(html, params?)` | rich message — telegram parses the dialect server-side (bot api 10.1) |

```ts
import { InputMessageContent } from 'puregram'

// text with HTML formatting
InputMessageContent.text('<b>hello</b>', { parseMode: 'HTML' })

// moscow coordinates
InputMessageContent.location(55.75, 37.61)

// venue
InputMessageContent.venue(55.75, 37.61, 'red square', 'moscow, russia')

// contact
InputMessageContent.contact('+7 999 123 4567', 'ivan', { lastName: 'petrov' })

// rich message — pick a dialect, telegram parses it
InputMessageContent.rich.md('# hello\n\nwhat is **up**')
```

::: tip no `type` discriminator
unlike most bot-api discriminated unions, `InputMessageContent` variants carry **no `type` field** — telegram disambiguates them structurally (text has `message_text`, location has `latitude`/`longitude`, contact has `phone_number`, rich has `rich_message`). the factory is hand-crafted for this reason
:::

the optional `params` on `text` accepts camelCase `TelegramInputTextMessageContent` fields: `parseMode`, `entities`, `linkPreviewOptions`, `disableWebPagePreview`

## chosen inline result

when a user selects a result, telegram fires a `chosen_inline_result` update (requires enabling inline feedback in @BotFather):

```ts
tg.on('chosen_inline_result', (result) => {
  console.log(result.from.id, 'chose result', result.resultId, 'for query', result.query)

  // if the result had an inline keyboard, inlineMessageId lets you edit it
  if (result.hasInlineMessageId()) {
    tg.api.editMessageReplyMarkup({
      inline_message_id: result.inlineMessageId,
      reply_markup: /* updated keyboard */
    })
  }
})
```

`ChosenInlineResultUpdate` exposes:
- `result.resultId` — the `id` from the `InlineQueryResult` the user picked
- `result.from` — the user
- `result.query` — the query string that produced the result
- `result.inlineMessageId` — optional; present when the result had a reply markup
- `result.location` — optional sender location

## see also

- [keyboards](/guide/telegram/keyboards) — `InlineKeyboard` for `replyMarkup` on results
- [formatting text](/guide/telegram/formatting-text) — `parse_mode` and entities in `InputMessageContent.text`
- [dispatch & filters](/guide/handling-updates/dispatch-and-filters) — registering `inline_query` handlers
- [methods](/api/methods) — full generated method list
