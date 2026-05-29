---
title: formatting text
description: parse_mode (HTML, Markdown, MarkdownV2), message entities, spoilers, block quotes, and a pointer to @puregram/markup for the ergonomic builder
---

# formatting text

telegram supports rich text via `parse_mode` or explicit `entities`. the simplest path is `parse_mode: 'HTML'` with standard html tags. for programmatic formatting, [`@puregram/markup`](/plugins/markup/) gives you a tagged-template builder

```ts
tg.onMessage((message) => {
  return message.reply('<b>bold</b> and <i>italic</i>', { parse_mode: 'HTML' })
})
```

## parse_mode values

pass `parse_mode` in the params of `send`, `sendPhoto`, `sendDocument`, etc. (anywhere a `caption` or `text` field exists):

| value | syntax |
|---|---|
| `'HTML'` | html tags — `<b>`, `<i>`, `<code>`, `<pre>`, `<a href>`, `<tg-spoiler>`, `<blockquote>`, … |
| `'Markdown'` | legacy markdown — `*bold*`, `_italic_`, `` `code` ``, `[text](url)` — limited nesting |
| `'MarkdownV2'` | extended markdown — same tags plus spoilers, strikethrough, underline; backslash-escape required |

telegram matches `parse_mode` case-insensitively, so `'html'`, `'markdown'`, and `'markdownv2'` work just as well — the table uses the canonical casing from the bot api docs

the field is typed `'HTML' | 'Markdown' | 'MarkdownV2' | (string & {})`, so the three canonical values show up in editor autocomplete while any other string (e.g. `'html'`) still typechecks

::: warning Markdown vs MarkdownV2
`'Markdown'` is the legacy mode and has significant limitations — no strikethrough, no underline, no spoiler, unreliable nesting. prefer `'HTML'` or `'MarkdownV2'` for new bots
:::

## HTML mode

the most reliable mode. telegram supports a subset of html:

```ts
const text = [
  '<b>bold</b>',
  '<i>italic</i>',
  '<u>underline</u>',
  '<s>strikethrough</s>',
  '<tg-spoiler>spoiler text</tg-spoiler>',
  '<code>inline code</code>',
  '<pre>preformatted block</pre>',
  '<pre><code class="language-ts">const x = 1</code></pre>',
  '<a href="https://example.com">link</a>',
  '<blockquote>quoted text</blockquote>',
  '<blockquote expandable>collapsible quote</blockquote>'
].join('\n')

message.send(text, { parse_mode: 'HTML' })
```

tags can be nested: `<b><i>bold italic</i></b>` works. unrecognized tags are passed through as literal text

## MarkdownV2 mode

MarkdownV2 is more expressive than legacy Markdown but requires backslash-escaping special characters (`_`, `*`, `[`, `]`, `(`, `)`, `~`, `` ` ``, `>`, `#`, `+`, `-`, `=`, `|`, `{`, `}`, `.`, `!`):

```ts
const text = [
  '*bold*',
  '_italic_',
  '__underline__',
  '~strikethrough~',
  '||spoiler||',
  '`inline code`',
  '```\npreformatted\n```',
  '[link text](https://example.com)',
  '>blockquote',
  '**>expandable blockquote||'   // multi-line collapsible
].join('\n')

message.send(text, { parse_mode: 'MarkdownV2' })
```

::: tip escape user content
when inserting user-supplied strings into MarkdownV2, escape every special character or switch to HTML mode where fewer characters need escaping
:::

## message entities

instead of `parse_mode`, pass an `entities` array directly. telegram accepts `MessageEntity` objects alongside unformatted text. this avoids parsing ambiguity and is safe with arbitrary user content:

```ts
await tg.api.sendMessage({
  chat_id: CHAT_ID,
  text: 'hello world',
  entities: [
    { type: 'bold', offset: 0, length: 5 },       // "hello"
    { type: 'italic', offset: 6, length: 5 }       // "world"
  ]
})
```

entity types include: `bold`, `italic`, `underline`, `strikethrough`, `spoiler`, `code`, `pre`, `text_link`, `text_mention`, `custom_emoji`, `blockquote`, `expandable_blockquote`, and more — see [objects](/api/objects) for the full list

`parse_mode` and `entities` are mutually exclusive — only one should be set per message

## captions

`parse_mode` and `caption_entities` work the same way on media captions:

```ts
message.sendPhoto(MediaSource.path('./cat.png'), {
  caption: '<b>cat</b> spotted',
  parse_mode: 'HTML'
})
```

## @puregram/markup — the ergonomic builder

writing raw HTML or MarkdownV2 strings by hand gets tedious fast. `@puregram/markup` is a satellite package that gives you tagged-template builders for composing formatted text:

```ts
import { html } from '@puregram/markup'

const text = html`<b>hello</b> ${username}` // interpolated values are literal text, never parsed as markup
message.send(text) // sent as text + entities — no parse_mode
```

the package supports HTML, Markdown, and MarkdownV2 builders, a parser direction (string back to entities), and a codec for round-tripping. it is installed separately — `@puregram/markup` — and is not part of `puregram` core

## see also

- [messages & media](/guide/telegram/messages-and-media) — sending messages and media
- [message extras](/guide/telegram/message-extras) — `LinkPreview` options per message
- [methods](/api/methods) — full generated method list
