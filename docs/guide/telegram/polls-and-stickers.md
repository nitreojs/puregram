---
title: polls & stickers
description: InputPollOption for building poll options with rich text and media, InputSticker for adding stickers to sets
---

# polls & stickers

two factories: `InputPollOption` for building the option list passed to `sendPoll`, and `InputSticker` for the sticker payloads used by `createNewStickerSet` and `addStickerToSet`

## InputPollOption

`InputPollOption` builds `TelegramInputPollOption` objects — the individual answer choices in a poll. the simplest form is plain text, but options can carry a parse mode, explicit entities, and attached media

```ts
import { InputPollOption } from 'puregram'

await tg.api.sendPoll({
  chat_id,
  question: 'pick one',
  options: [
    InputPollOption.text('first choice'),
    InputPollOption.text('second choice')
  ]
})
```

### factory

`InputPollOption.text(text, extras?)` — the only factory. `text` is the visible label (up to 100 characters)

the optional `extras` object:

| field | type | what it does |
|---|---|---|
| `parseMode` | `'HTML' \| 'Markdown' \| 'MarkdownV2'` | parse mode for the option text — currently only `'MarkdownV2'`-style custom emoji entities are processed |
| `entities` | `TelegramMessageEntity[]` | explicit entity list instead of `parseMode` |
| `media` | `TelegramInputPollOption['media']` | media attached to the option |

```ts
import { InputPollOption } from 'puregram'

// option with a custom emoji via MarkdownV2
await tg.api.sendPoll({
  chat_id,
  question: 'rate it',
  options: [
    InputPollOption.text('👍 good'),
    InputPollOption.text('👎 bad'),
    InputPollOption.text('custom emoji option', { parseMode: 'MarkdownV2' })
  ]
})

// option with explicit entities
await tg.api.sendPoll({
  chat_id,
  question: 'choose',
  options: [
    InputPollOption.text('option a', { entities: myEntities }),
    InputPollOption.text('option b')
  ]
})
```

::: tip quiz polls
for quiz-mode polls, also pass `type: 'quiz'` and `correct_option_id` in the `sendPoll` params — those sit outside `options` and are not part of `InputPollOption`
:::

## InputSticker

`InputSticker` builds `TelegramInputSticker` objects for `createNewStickerSet` and `addStickerToSet`. one factory per sticker format: `static`, `animated`, and `video`

```ts
import { InputSticker, MediaSource } from 'puregram'

// upload the file once, then reference it by the returned file id
const file = await tg.api.uploadStickerFile({
  user_id,
  sticker: MediaSource.path('./cat.webp'),
  sticker_format: 'static'
})

await tg.api.addStickerToSet({
  user_id,
  name: 'my_pack_by_mybot',
  sticker: InputSticker.static(file.file_id, ['🐱'])
})
```

### factories

all three share the same signature: `(sticker, emojiList, params?)`

| factory | format | accepted file |
|---|---|---|
| `InputSticker.static(sticker, emojiList, params?)` | `'static'` | `.WEBP` or `.PNG` image |
| `InputSticker.animated(sticker, emojiList, params?)` | `'animated'` | `.TGS` animated sticker |
| `InputSticker.video(sticker, emojiList, params?)` | `'video'` | `.WEBM` video sticker |

- `sticker` — a file id or url for the sticker file; for a new local file, run it through `uploadStickerFile` first to get a file id (`attach://` is the low-level multipart alternative)
- `emojiList` — array of one or more emoji that describe the sticker (e.g. `['🐱', '😺']`)
- `params` — optional camelCase extras (`keywords`, `maskPosition`) from `TelegramInputSticker`

```ts
import { InputSticker } from 'puregram'

// catId / dogId are file ids returned by uploadStickerFile
await tg.api.createNewStickerSet({
  user_id,
  name: 'my_pack_by_mybot',
  title: 'my pack',
  stickers: [
    InputSticker.static(catId, ['🐱'], { keywords: ['cat', 'cute'] }),
    InputSticker.static(dogId, ['🐶'], { keywords: ['dog'] })
  ],
  sticker_format: 'static'
})

// animated (.tgs) and video (.webm) stickers work the same way — upload, then reference
await tg.api.addStickerToSet({
  user_id,
  name: 'my_pack_by_mybot',
  sticker: InputSticker.animated(waveId, ['👋'])
})
```

::: tip new sticker files
new files go through [`uploadStickerFile`](/api/methods#uploadstickerfile) first — it takes a `MediaSource` and returns a `File` whose `file_id` you reuse across `createNewStickerSet` / `addStickerToSet`. the low-level alternative is an `attach://` reference to a file sent in the same multipart request
:::

## see also

- [messages & media](/guide/telegram/messages-and-media) — `MediaSource` and file uploads
- [methods](/api/methods) — full generated method list
