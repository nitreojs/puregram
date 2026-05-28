---
title: markup parsers
description: html / htmlb / md / markdown parsers for @puregram/markup — the interpolation model, literal-text safety, and the trusted raw-string path
---

# parsers

already have an html or markdown string from somewhere — a database, a config file, an llm? paste it in. each parser produces the same `Formatted` shape every builder does, so the result drops into `message.send(...)` with `markup()` installed and no `parse_mode` needed

there are four entry points: `html` / `htmlb` for telegram's html flavor, and `md` / `markdown` for telegram's markdown v2. each is both a tagged template and a plain function — and the difference between those two forms is the whole safety story

## the interpolation model — read this first

a parser has **two forms**, and they treat their input very differently:

| form | input | what happens |
|---|---|---|
| tagged template — ``html`<b>${name}</b>` `` | static parts + interpolations | static parts are **parsed as markup**; interpolations are inserted as **literal text** |
| function call — `html(rawString)` | one raw string | the **whole string is parsed** as markup |

### static parts are parsed; interpolations are literal text

in the tagged-template form, the literal parts you write between the backticks are real markup — `<b>`, `**`, `[link](url)` all get parsed. but every `${...}` you interpolate is spliced in as **plain text that is never parsed**. it cannot open or close a tag, cannot start a bold run, cannot inject anything:

```ts
const userName = 'A**lice**'

html`<b>${userName}</b>`
// → text: 'A**lice**', one bold entity over all 9 chars
// the **…** stays literal — it does NOT become bold
```

this is the key point: it is **not** "auto-escaping". nothing is escaped and then un-escaped. the interpolated string is simply treated as text content, not as source to re-parse. a string that looks like a closing tag stays text:

```ts
const evil = '</b>'

html`<b>${evil}</b>`
// → text: '</b>', one bold entity — the interpolated </b> can't close the <b> tag
```

so user input is safe by construction. you never escape anything you interpolate, because it was never going to be parsed

numbers coerce to their string form; `null` / `undefined` / `false` are dropped

### interpolate a `Formatted` to splice pre-formatted markup

when you interpolate a [`Formatted`](/plugins/markup/codec) value — a builder result, or another `html`/`md` template — its entities are merged in at the right offset rather than being flattened to text:

```ts
import { html, bold } from '@puregram/markup'

const inner = bold('important')

html`note: ${inner} — read it`
// → 'note: important — read it', with a bold entity over 'important'
```

### a literal special char goes in the static part as an entity

since interpolations are never parsed, you can't sneak a literal `<` or `&` in through `${...}` and expect it as markup. to show a literal special char in the **static** part of an html template, write the html entity:

```ts
html`use &lt;b&gt; for bold`
// → 'use <b> for bold' (rendered literally, no entity)
```

markdown uses backslash escapes in the static part (`\*`, `\_`, …)

### the function-call form parses a raw string

`html(str)` / `md(str)` take a single raw string and parse **the whole thing** as markup. this is the trusted path — use it only for markup **you** control, never for untrusted input:

```ts
html('<b>hi</b>')      // → parses, one bold entity
md('**bold** _italic_') // → parses both
```

if you have an untrusted raw string and still want to parse it, reach for the [lenient variants](/plugins/markup/codec) so malformed input degrades to plain text instead of throwing

## `html` / `htmlb`

parses telegram's html flavor:

```ts
import { html } from '@puregram/markup'

await message.send(html`
  hello, <b>${userName}</b>!
  <i>italic</i> · <u>underline</u> · <s>strike</s> · <tg-spoiler>secret</tg-spoiler>
  <code>inline</code> · <a href="https://x.com">link</a>
  <blockquote>quoted line</blockquote>
  <blockquote expandable>line 1
  line 2
  line 3
  line 4 — needs >3 lines for the expand UI</blockquote>
`)
```

`htmlb` is the same parser but treats `<br>` as an explicit newline (regular `html` collapses runs of whitespace, including newlines, to a single space). pick `htmlb` when your html arrives without the conventional newline-as-significant model:

```ts
htmlb`
  first line <br>
  second line <br>
  <b>third line, <br>
  still bold across breaks</b>
`
```

### custom html tags

extend the parser with your own tags. the handler receives the inner `Formatted` content plus a `TagInfo` describing where it sat in the source:

```ts
import { html, Formatted } from '@puregram/markup'

html.define({
  upper: content => new Formatted(content.text.toUpperCase(), content.entities)
})

html`shouting: <upper>quietly</upper>`
// → 'shouting: QUIETLY'
```

`html.define(...)` mutates the **shared** `html`/`htmlb` registry — any later `html`-tagged template anywhere sees the new tag. when you want a scoped registry that doesn't bleed, use `html.with(...)`, which returns a fresh callable cloned from the current registry:

```ts
const fancy = html.with({
  h1: c => new Formatted(`H1: ${c.text}`, c.entities)
})

fancy`<h1>title</h1>`   // works — scoped to `fancy`
html`<h1>title</h1>`    // throws — `h1` isn't in the shared registry
```

a `TagInfo` carries `tag`, `attrs`, `parent`, `ancestors`, `index`, and `siblingCount`. defining a tag whose name collides with a built-in throws `MarkupParseError`

## `md` / `markdown`

parses markdown v2 (telegram's flavor), with the same tagged-template / function-call duality:

```ts
import { md } from '@puregram/markup'

await message.send(md`
  **bold** _italic_ __underline__ ~~strike~~ ||spoiler||
  [link](https://x.com), [tg user mention](tg://user?id=${message.from?.id ?? 0})
  \`code\`, then a fenced block:
  \`\`\`js
  console.log('hello')
  \`\`\`
  > regular quote
  > continues here
  >> expandable line 1
  >> expandable line 2
`)
```

`markdown` is an alias of `md`. the same literal-text rule applies to interpolations — user input in `tg://user?id=${userId}` and similar can't break the syntax, because the interpolated value is never re-parsed

## output

every parser returns the same `{ text, entities }` payload as the builders — no `parse_mode`. `MarkupParseError` is thrown on malformed input in the strict forms; see [codec](/plugins/markup/codec) for the lenient variants and the error contract

## see also

- [codec](/plugins/markup/codec) — `Formatted.fromMessage`, `toHtml()` / `toMarkdown()`, lenient parsing, errors
- [builders](/plugins/markup/builders) — compose formatting from values instead of parsing a string
- [overview](/plugins/markup/) — install + the `format` entry template
- [formatting text](/guide/telegram/formatting-text) — the raw `parse_mode` path
