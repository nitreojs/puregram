---
title: markup codec
description: hydrate, serialize, and parse permissively — Formatted.fromMessage, toHtml / toMarkdown, hand-rolling a Formatted, and the lenient parsers
---

# codec

`Formatted` is a two-way pipe. you can hydrate one from an incoming message, walk it back into html or markdown source, parse foreign markup permissively when you don't trust the input, or build one by hand

## `Formatted.fromMessage(msg)`

hydrates a `Formatted` from a `MessageUpdate` (or any `{ text, entities, caption, caption_entities }` shape). it picks `text` + `entities` when a `text` is present, otherwise falls back to `caption` + `caption_entities`:

```ts
import { Formatted, format } from '@puregram/markup'

tg.command('quote', async (message) => {
  const reply = message.replyToMessage

  if (reply == null) {
    return
  }

  // preserves the user's original formatting — bold stays bold, links stay clickable
  const original = Formatted.fromMessage(reply)

  await message.send(format`
    you said:
    ${original}
  `)
})
```

it's round-trip safe: `Formatted.fromMessage(msg).toPayload()` reproduces the original `{ text, entities }` pair. wrapper-class instances are unwrapped to their raw `.raw` payload first, and camelCase entity fields (`customEmojiId`, `unixTime`, …) are normalized to the snake_case bot-api shape

## `toPayload()`

returns the plain `{ text, entities }` payload — the shape every telegram method expects on the wire. reach for it when you'd rather forward the raw pair than carry the `Formatted` instance around:

```ts
const { text, entities } = format`${bold('hi')}`.toPayload()
```

## `formatted.toHtml()` / `formatted.toMarkdown()`

serializes a `Formatted` back into html or markdown v2 source. it escapes specials, emits nested tags for nested entities, and handles non-rectangular entities (text_link with url, custom_emoji with id, pre with language, text_mention with user):

```ts
const f = format`${bold('build:')} ${italic('passing')}`

f.toHtml()       // '<b>build:</b> <i>passing</i>'
f.toMarkdown()   // '**build:** _passing_'
```

it round-trips: ``html`<b>hi</b>`.toHtml()`` returns `<b>hi</b>` (modulo nesting order — both `<i><b>x</b></i>` and `<b><i>x</i></b>` parse to the same entity set, so they may serialize to either)

the same two are available as standalone functions if you'd rather operate on a raw `{ text, entities }` pair without wrapping it first — both accept a `Formatted` or a plain `{ text, entities }`:

```ts
import { toHtml, toMarkdown } from '@puregram/markup'

toHtml({ text: 'hi', entities: [{ type: 'bold', offset: 0, length: 2 }] })
// '<b>hi</b>'
```

handy for logging messages in readable form, persisting drafts, or exporting outside telegram

## hand-rolling a `Formatted`

every builder ultimately produces a `Formatted` — text plus an array of bot-api entities. build one yourself when none of the conveniences fit:

```ts
import { Formatted } from '@puregram/markup'

const f = new Formatted('hello world', [
  { type: 'bold', offset: 0, length: 5 },
  { type: 'italic', offset: 6, length: 5 }
])

await message.send(f)
```

useful for porting code that already emits a `{ text, entities }` shape from somewhere else. the second argument defaults to `[]`, so `new Formatted('plain text')` is a valid no-entities value

## lenient parsing — `md.lenient` / `html.lenient` / `htmlb.lenient`

the strict parsers throw `MarkupParseError` on malformed input — great for catching bugs in markup you wrote, terrible for llm-generated markdown that breaks every other token. the lenient variants take a **raw string**, swallow parse errors, and return a plain-text `Formatted` instead:

```ts
const broken = '**unclosed bold and [a link with no url'

md(broken)         // throws MarkupParseError
md.lenient(broken) // → Formatted { text: broken, entities: [] } — no throw
```

well-formed input parses identically to the strict form. `html.lenient` and `htmlb.lenient` mirror the same shape for html

::: tip why a separate method
`md.lenient(input)` was picked over `md(input, { onError: 'plain' })` because the tagged-template form already eats the second-argument slot for interpolations. a separate method keeps the call site obvious and avoids the "did you mean the strict form?" footgun
:::

## errors

`MarkupParseError` is thrown by `html`, `htmlb`, `md`, and the custom-tag handlers when input doesn't parse. it carries the source position and the offending source so you can build helpful diagnostics:

```ts
import { md, MarkupParseError } from '@puregram/markup'

try {
  md('broken **bold')
} catch (error) {
  if (error instanceof MarkupParseError) {
    console.error(error.message, 'at offset', error.offset)
    // error.source holds the original input string
  }
}
```

the instance exposes `offset` (the source-coordinate offset of the failure) and `source` (the original input). the `message` already includes `at offset N`

## typescript

```ts
import type {
  Entity,           // single bot-api MessageEntity shape
  HtmlCallable,     // type of `html` and `htmlb`
  MdCallable,       // type of `md` and `markdown`
  Modifier,         // type of `bold`, `italic`, etc — chainable callable
  ModifierName,     // 'bold' | 'italic' | 'underline' | …
  MessageLike,      // shape Formatted.fromMessage accepts
  FormattedPayload, // the { text, entities } pair toPayload returns
  TagDefinitions,   // Record<string, TagHandler> for html.define / html.with
  TagHandler,       // (content: Formatted, info: TagInfo) => Formatted
  TagInfo,          // metadata passed to a TagHandler
  TimeFormat        // shape of the time() format options
} from '@puregram/markup'
```

## see also

- [parsers](/plugins/markup/parsers) — `html` / `md`, the interpolation model, custom tags
- [builders](/plugins/markup/builders) — compose a `Formatted` from values
- [overview](/plugins/markup/) — install + the `format` entry template
