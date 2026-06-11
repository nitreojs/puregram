---
title: '@puregram/rich'
description: safe rich-message (html/markdown) emitter for puregram — escapes interpolated strings, renders builder nodes, produces the InputRichMessage envelope
---

# `@puregram/rich`

a tagged-template emitter for telegram's **rich messages** — structured content with headings, lists, code blocks, formulas, spoilers, and more. the server parses the final string; `@puregram/rich` makes authoring safe by escaping every interpolated string automatically and rendering builder nodes to the target dialect

```ts
import { rich } from '@puregram/rich'

// inside a message handler
await message.sendRich(rich.md`
  # ${title}

  ${rich.bold('status:')} ${status}

  ${rich.list(items)}
`)
```

## install

::: code-group

```sh [yarn]
yarn add @puregram/rich
```

```sh [npm]
npm i -S @puregram/rich
```

```sh [pnpm]
pnpm add @puregram/rich
```

:::

`@puregram/rich` depends on `@puregram/api` for types. `Rich` implements `RichLike`, so it can be passed directly wherever `rich_message` is accepted — no manual `.toInputRichMessage()` needed. per-update shortcuts (`message.sendRich`, `message.replyWithRich`, `message.editRich`) are covered in the [sending](#sending) section below.

## the two dialects

pick one per message. both produce a `Rich` envelope with the same methods:

```ts
rich.md`…`        // markdown dialect
rich.markdown`…`  // alias
rich.html`…`      // html dialect
```

calling a tag as a plain function (no backticks) passes the string straight through — no escaping, no dedent:

```ts
rich.md('# already formatted')
```

the same tags also accept a **block array** — an array of block nodes joined with a blank line between each block. use this form when building structured content from data rather than writing prose inline:

```ts
rich.md([
  rich.heading(1, title),
  rich.list(items.map(i => rich.paragraph(i.text))),
  rich.codeBlock(snippet, 'ts')
])
```

use the template for prose; use the array form for composing top-level blocks from data.

## interpolation model

template literals are **dedented** (common leading indentation stripped) so you can write at the natural indent level of your code. the interpolation rules mirror `@puregram/markup`:

| interpolated value | what happens |
|---|---|
| `string` | dialect-escaped → renders literally, cannot inject formatting |
| `number` | stringified, then escaped |
| builder node | rendered to the template's dialect |
| `Rich` | inlined as-is (dialect must match; mismatch throws `RichError`) |
| array | each item rendered and concatenated |
| `null` / `undefined` / `false` | empty string |

**escape sets:**
- markdown: backslash-escapes `` \ ` * _ ~ = | [ ] ( ) # > ! + - < ``
- html: `& < > "` → numeric entities (always safe)

because strings are always escaped, user content in `${userText}` is safe in both dialects.

## inline builders

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

content args (`x`, `text`) accept `string | RichNode | Rich | RichContent[]`. strings inside builders are escaped, so `rich.bold(userInput)` is always safe.

## block builders

| builder | notes |
|---|---|
| `rich.heading(level, content)` | `level` 1–6 → `#…######` / `<h1>…<h6>` |
| `rich.paragraph(content)` | bare text in markdown / `<p>` in html |
| `rich.codeBlock(code, language?)` | fenced ` ``` ` / `<pre><code class="language-…">` |
| `rich.blockquote(content)` | `>` lines / `<blockquote>` |
| `rich.divider()` | `---` / `<hr/>` |
| `rich.list(items)` | `- ` bullets / `<ul>` |
| `rich.orderedList(items, { start? })` | numbered `1.` / `<ol start="…">` |
| `rich.details(summary, body, { open? })` | `<details><summary>` — collapsible block (legal in both dialects) |
| `rich.mathBlock(latex)` | `$$…$$` / `<tg-math-block>…</tg-math-block>` |

## composition helpers

### `rich.join(items, separator?)`

joins an array of content with a separator. if any item is a block node, items are newline-joined; otherwise they're concatenated with the separator (default `''`):

```ts
const tags = ['node', 'typescript', 'telegram']

rich.md`tags: ${rich.join(tags.map(t => rich.code(t)), ', ')}`
```

### `rich.br()`

explicit line break — `<br>` in html, a hard newline in markdown:

```ts
rich.html`
  ${rich.blockquote([
    'first line',
    rich.br(),
    rich.italic('second line')
  ])}
`
```

## the `Rich` envelope

every template tag returns a `Rich`:

```ts
class Rich {
  readonly dialect: 'markdown' | 'html'
  readonly content: string

  rtl(value?: boolean): this               // mark right-to-left
  noEntityDetection(value?: boolean): this // disable auto link/mention/hashtag detection

  toInputRichMessage(): TelegramInputRichMessage
  toJSON(): TelegramInputRichMessage
}
```

```ts
const r = rich.md`# ${heading}`

r.toInputRichMessage()
// → { markdown: '# My heading' }

r.rtl().noEntityDetection().toInputRichMessage()
// → { markdown: '# My heading', is_rtl: true, skip_entity_detection: true }
```

## sending

per-update shortcuts fill `chat_id` and `message_id` automatically:

```ts
import { rich } from '@puregram/rich'

// send a new rich message in the same chat
await message.sendRich(rich.html`
  <h1>${title}</h1>
  <p>posted by ${rich.mentionUser(authorName, authorId)}</p>
  ${rich.divider()}
  ${rich.codeBlock(snippet, 'ts')}
`)

// reply to the incoming message
await message.replyWithRich(rich.md`# ${heading}`)

// edit the bot's own message to rich content
await message.editRich(rich.md`# updated ${status}`)
```

a `Rich` value can also be passed directly to `telegram.api.sendRichMessage` — `rich_message` accepts `TelegramInputRichMessage | RichLike` and `Rich` implements `RichLike`:

```ts
await telegram.api.sendRichMessage({
  chat_id,
  rich_message: rich.md`# ${title}`
})
```

`.toInputRichMessage()` is still available when you need the raw shape explicitly.

## coming incrementally

tables, media embeds (`media`), `pullQuote`, `footer`, `taskList`, `map`, `collage`, and `slideshow` are specified and will be added in follow-up releases

## errors

`RichError` is thrown when a `Rich` value of the wrong dialect is interpolated into a template:

```ts
import { RichError } from '@puregram/rich'

try {
  const htmlRich = rich.html`<b>formatted</b>`
  const r = rich.md`# heading ${htmlRich}`  // throws RichError
} catch (error) {
  if (error instanceof RichError) {
    console.error(error.message)
  }
}
```

## typescript

```ts
import type {
  RichContent,   // string | number | RichNode | Rich | null | undefined | false | RichContent[]
  RichNode,      // { level: 'inline' | 'block'; render(dialect: Dialect): string }
  Dialect        // 'markdown' | 'html'
} from '@puregram/rich'
```

## see also

- [markup](/plugins/markup/) — entity-based formatting for plain messages, no `parse_mode`
- [formatting text](/guide/telegram/formatting-text) — the raw `parse_mode` path, for comparison
- [plugins & .extend](/guide/concepts/plugins) — how `telegram.extend` works in general
