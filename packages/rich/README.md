## @puregram/rich

_safe rich-message emitter for `puregram`_

### introduction

telegram's **rich messages** accept a raw html or markdown string — the server parses it. there is no `entities[]` array and no way around the string. `@puregram/rich` makes that safe and ergonomic: literal template text passes through unchanged; only interpolated `${…}` is touched — strings are dialect-escaped so user input can't inject formatting, and builder nodes are rendered to the target dialect automatically.

the result is a `Rich` envelope with a `.toInputRichMessage()` method that maps straight onto the `rich_message` argument.

### quick start

```ts
import { rich } from '@puregram/rich'

// inside a message handler
await message.sendRich(rich.md`
  # ${title}

  ${rich.bold('status:')} ${status}

  ${rich.list(items)}
`)
```

### installation

```sh
$ yarn add @puregram/rich
$ npm i -S @puregram/rich
```

---

## interpolation and escaping

template literals are **dedented** (common leading indentation stripped) so you can write multi-line content at the natural indent level of your code.

| interpolation | what happens |
|---|---|
| `${string}` | dialect-escaped → renders literally, cannot inject formatting |
| `${number}` | stringified, then escaped |
| `${node}` (a builder result) | rendered to the template's dialect |
| `${Rich}` | inlined as-is (dialect must match; mismatch throws `RichError`) |
| `${array}` | each item rendered and concatenated |
| `${null \| undefined \| false}` | empty string |

**escape sets:**
- markdown: backslash-escapes the rich-md specials `` \ ` * _ ~ = | [ ] ( ) # > ! + - < ``
- html: `& < > "` → numeric entities (`&#38;` etc. — numeric is always safe)

since strings are always escaped, user input in `${userText}` is safe in both dialects.

---

## template tags

```ts
import { rich } from '@puregram/rich'

rich.md`…`        // markdown dialect
rich.markdown`…`  // alias of rich.md
rich.html`…`      // html dialect
```

calling a tag as a plain function passes the string through as-is (no escaping, no dedent):

```ts
rich.md('# already formatted')
```

the same tags also accept a **block array** — pass an array of block nodes built with the block builders and they are joined with a blank line between each block. use this form when building content from data rather than prose:

```ts
rich.md([
  rich.heading(1, title),
  rich.list(items.map(i => rich.paragraph(i.text))),
  rich.codeBlock(snippet, 'ts')
])
```

use the template for inline prose; use the array form when composing top-level blocks from data.

---

## inline builders

builders return marker nodes that know how to render in either dialect — use them as interpolated values inside a template tag.

| builder | markdown | html |
|---|---|---|
| `rich.bold(x)` | `**x**` | `<b>x</b>` |
| `rich.italic(x)` | `*x*` | `<i>x</i>` |
| `rich.underline(x)` | `<u>x</u>` | `<u>x</u>` |
| `rich.strikethrough(x)` | `~~x~~` | `<s>x</s>` |
| `rich.spoiler(x)` | `\|\|x\|\|` | `<tg-spoiler>x</tg-spoiler>` |
| `rich.code(x)` | `` `x` `` | `<code>x</code>` |
| `rich.marked(x)` | `==x==` | `<mark>x</mark>` |
| `rich.subscript(x)` | `<sub>x</sub>` | `<sub>x</sub>` |
| `rich.superscript(x)` | `<sup>x</sup>` | `<sup>x</sup>` |
| `rich.link(text, url)` | `[text](url)` | `<a href="url">text</a>` |
| `rich.mentionUser(text, userId)` | `[text](tg://user?id=…)` | `<a href="tg://user?id=…">text</a>` |
| `rich.math(latex)` | `$latex$` | `<tg-math>latex</tg-math>` |
| `rich.customEmoji(id, alt)` | `![alt](tg://emoji?id=…)` | `<tg-emoji emoji-id="…">alt</tg-emoji>` |
| `rich.time(label, unix, format?)` | `![label](tg://time?unix=…)` | `<tg-time unix="…">label</tg-time>` |
| `rich.reference(text, name)` | `[text](#name)` | `<a href="#name">text</a>` |
| `rich.anchor(name)` | `<a name="…"></a>` | `<a name="…"></a>` |

builder content args (`text`, `x`) accept `string | RichNode | Rich | RichContent[]` — strings inside builders are escaped too, so `rich.bold(userInput)` is always safe.

---

## block builders

| builder | notes |
|---|---|
| `rich.heading(level, content)` | `level` is `1`–`6`. renders `#…######` / `<h1>…<h6>` |
| `rich.paragraph(content)` | bare text in markdown / `<p>` in html |
| `rich.codeBlock(code, language?)` | fenced ` ``` ` / `<pre><code class="language-…">` |
| `rich.blockquote(content)` | `>` lines / `<blockquote>` |
| `rich.divider()` | `---` / `<hr/>` |
| `rich.list(items)` | `- ` / `<ul>` |
| `rich.orderedList(items, { start? })` | `1.` / `<ol start="…">` |
| `rich.details(summary, body, { open? })` | `<details><summary>` (legal in both dialects) |
| `rich.mathBlock(latex)` | `$$latex$$` / `<tg-math-block>latex</tg-math-block>` |
| `rich.footer(content)` | `<footer>…</footer>` (both dialects) |
| `rich.pullQuote(content, cite?)` | `<aside>…<cite>cite</cite></aside>` (both dialects) |
| `rich.taskList(items)` | `items` is `{ text, done? }[]`. md `- [ ]` / `- [x]`; html `<ul><li>☐/☑ …</li></ul>` |
| `rich.media(url, { type?, caption?, spoiler? })` | http(s) url only. md `![](url)`; html `<img>`/`<video>`/`<audio>` (`<figure><figcaption>` when captioned) |
| `rich.photo(url, { caption?, spoiler? })` | `media` with type fixed to `photo` |
| `rich.video(url, { caption?, spoiler? })` | `media` with type fixed to `video` |
| `rich.audio(url, { caption?, spoiler? })` | `media` with type fixed to `audio` |
| `rich.map(lat, long, { zoom?, caption? })` | `<tg-map lat long zoom/>` (both dialects; `<figure>` when captioned) |
| `rich.collage(items, { caption? })` | `<tg-collage>…media nodes…</tg-collage>` (both dialects) |
| `rich.slideshow(items, { caption? })` | `<tg-slideshow>…media nodes…</tg-slideshow>` (both dialects) |
| `rich.table(rows, { header?, align?, bordered?, striped?, caption? })` | md GFM table (first row = header); html `<table>` with `th`/`td`, `align`, `<caption>`, `bordered`/`striped` attrs |

media builders (`media`, `photo`, `video`, `audio`, `map`, `collage`, `slideshow`) accept **http(s) urls only** — `file_id` and upload-based embedding are not supported by the bot api rich-message format.

---

## composition helpers

### `rich.join(items, separator?)`

joins an array of content pieces. if any item is a block node the separator becomes a newline; otherwise items are concatenated with the separator string (default `''`).

```ts
rich.md`
  ${rich.join(tags.map(t => rich.code(t)), ', ')}
`
```

### `rich.br()`

explicit line break — `<br>` in html, a hard newline in markdown. useful inside `blockquote` or joined inline runs.

---

## the `Rich` envelope

```ts
class Rich {
  readonly dialect: 'markdown' | 'html'
  readonly content: string      // the emitted dialect string

  rtl(value?: boolean): this                // mark right-to-left
  noEntityDetection(value?: boolean): this  // disable auto link/mention detection

  toInputRichMessage(): TelegramInputRichMessage
  // → { markdown?: string, html?: string, is_rtl?, skip_entity_detection? }

  toJSON(): TelegramInputRichMessage
}
```

```ts
const r = rich.md`# hello`

r.toInputRichMessage()
// → { markdown: '# hello' }

r.rtl().noEntityDetection().toInputRichMessage()
// → { markdown: '# hello', is_rtl: true, skip_entity_detection: true }
```

---

## sending

the shortest path is via per-update shortcuts — `chat_id` and `message_id` are filled automatically:

```ts
import { rich } from '@puregram/rich'

// inside a message handler
await message.sendRich(rich.html`
  <h1>${title}</h1>
  <p>sent by ${rich.mentionUser(authorName, authorId)}</p>
  ${rich.divider()}
  ${rich.codeBlock(snippet, 'ts')}
`)

// reply to the incoming message
await message.replyWithRich(rich.md`# ${heading}`)

// edit the bot's own message to rich content
await message.editRich(rich.md`# updated`)
```

a `Rich` value can also be passed directly to `telegram.api.sendRichMessage` — `rich_message` accepts `TelegramInputRichMessage | RichLike` and `Rich` implements `RichLike`, so no manual unwrap is needed:

```ts
await telegram.api.sendRichMessage({
  chat_id,
  rich_message: rich.md`# ${title}`
})
```

`.toInputRichMessage()` is still available as a low-level escape hatch when you need the raw shape.

---

---

## errors

`RichError` is thrown when a `Rich` of the wrong dialect is interpolated into a template (e.g. an `html` envelope inside a `rich.md\`\``):

```ts
import { RichError } from '@puregram/rich'

try {
  const htmlRich = rich.html`<b>formatted</b>`
  const r = rich.md`# heading ${htmlRich}`  // throws
} catch (error) {
  if (error instanceof RichError) {
    console.error(error.message)
  }
}
```

---

## typescript

```ts
import type {
  RichContent,   // string | number | RichNode | Rich | null | undefined | false | RichContent[]
  RichNode,      // a builder result — { level: 'inline' | 'block', render(dialect): string }
  Dialect        // 'markdown' | 'html'
} from '@puregram/rich'
```
