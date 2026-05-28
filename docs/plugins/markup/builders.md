---
title: markup builders
description: the @puregram/markup builder catalog — bold, italic, link, mentions, time, blockquotes, join, and the two-form calling convention
---

# builders

every builder produces a [`Formatted`](/plugins/markup/codec) — a `{ text, entities }` pair. you compose them, interpolate them into [`format`](/plugins/markup/) templates, and send the result with `.extend(markup())` installed

## two interchangeable forms

_almost_ every builder works as both a **function call** and a **tagged template** — pick whichever reads best at the call site:

```ts
// tagged template
bold`foo ${italic`bar`}`

// function call
bold(italic('bar'))
```

the two are equivalent for nested builders. there is one footgun: to embed a builder inside a template you **must** use the tagged form on both sides. interpolating a builder into a plain backtick string coerces it via `toString()`, which collapses to the plain text only:

```ts
// works — entities preserved
bold`foo ${italic`bar`}`

// broken — italic('bar') is stringified, entities lost
bold(`foo ${italic('bar')}`)
```

## chaining modifiers

the eight text modifiers (`bold`, `italic`, `underline`, `strikethrough`, `spoiler`, `code`, `blockquote`, `expandableBlockquote`) expose every other modifier as a property, so you can stack them without nesting:

```ts
bold.italic('all together')
bold.italic.underline('all three')
bold.italic.underline`tagged form too`
```

chain order is preserved (outermost first)

::: warning chaining vs. what telegram renders
at the type level every modifier chains to every other one and emits both entities on the wire — but telegram clients override a few combinations:

| chain | result |
|---|---|
| text styles within text styles (`bold.italic`, `spoiler.bold`, …) | compounds correctly |
| anything inside `blockquote` / `expandableBlockquote` | inner styles render fine |
| anything inside `code` (`code.bold`) | inner styles **dropped** — code renders as monospace plain text |
| `code` within anything (`bold.code`) | renders as monospace; outer style ignored |
| `blockquote` nested in `blockquote` | telegram flattens to a single quote |

tldr: stack text styles freely; treat `code` and `pre` as leaves
:::

## entry templates

### `format(strings, ...rest)`

formats the template and strips the **first** pack of indentation off all lines (like `stripIndent`):

```ts
format`
  hello!
  those two spaces at the start get stripped
    but those additional two spaces stay
`
```

### `formatDedent(strings, ...rest)`

like `format` but strips **every** leading whitespace prefix (like `stripIndents`):

```ts
formatDedent`
  hello!
  those two spaces strip
    these extra two strip too
`
```

## text modifiers

these eight share the chainable two-form shape described above

### `bold(text)` · `italic(text)` · `underline(text)` · `strikethrough(text)` · `spoiler(text)`

```ts
bold('hey!')
bold`hey!`
italic('hey!')
underline('hey!')
strikethrough('hey!')
spoiler('hey!')
```

### `code(text)`

```ts
code('const x = 5')
code`const x = 5`
```

::: tip
`code` technically chains (`code.bold(...)` typechecks and emits a `bold` entity) but telegram drops everything inside a `code` span on the wire. treat `code` as a leaf modifier
:::

### `blockquote(text)` / `expandableBlockquote(text)`

```ts
blockquote`first line
second line`

expandableBlockquote`one line
two lines
three lines (telegram needs >3 lines for the expand UI)
four lines
five lines`
```

## field builders

these carry payload beyond the text — a url, a user id, a language. several are dual-form: an eager `(text, payload)` signature, plus a curried form that returns a wrapper you call with the text

### `link(text, url)` / `link(url)`

```ts
// eager: text + url positionally
link('puregram on github', 'https://github.com/nitreojs/puregram')

// curried tagged-template — useful for embedding a wrapped piece in a template
link('https://core.telegram.org/bots/api')`bot api docs`

// curried parens form — same shape
link('https://t.me/pureforum')('the forum')
```

### `pre(text, language?)`

```ts
pre('console.log("hi")', 'js')   // 2-arg eager form, with language
pre`unhighlighted block`         // tagged-template, no language
pre()`also unhighlighted`        // curried, no language
```

::: tip
curried-with-language is intentionally not supported — use the 2-arg eager form when you need a `language` highlight. and the same monospace-leaf rule as `code` applies: `pre` content is verbatim, inner formatting is stripped by clients
:::

### `mentionUser(text, userId)` / `mentionUser(userId)`

generates a `text_mention` entity linking to a user by id, even with no `username`:

```ts
mentionUser('dude', 398859857)
```

### `mentionBot(text, botId)` / `mentionBot(botId)`

same as `mentionUser` but synthesises `is_bot: true` on the user payload, so the mention follows bot-mention semantics:

```ts
mentionBot('robodude', telegram.bot.id)
```

### `textMention(text, user)` / `textMention(user)`

pass a full bot-api `User` object through verbatim:

```ts
textMention('dude', { id: 398859857, is_bot: false, first_name: 'dude' })
```

### `customEmoji(text, customEmojiId)` / `customEmoji(customEmojiId)`

```ts
customEmoji('😁', '5448765217123141')
```

### `time(text, when, format?)` / `time(when, format?)`

attaches a `date_time` entity that telegram clients render in the recipient's locale and timezone. accepts a unix timestamp (seconds) or a `Date`:

```ts
time('see you', new Date(), { dateStyle: 'short', timeStyle: 'short' })

// curried form
time(new Date(), { relative: true })`see you`
```

the `format` argument is a `TimeFormat` — a structured wrapper around telegram's `date_time_format` flag string:

| field | flag | meaning |
|---|---|---|
| `relative: true` | `r` | renders relative to "now" — "in 3 minutes". **mutually exclusive** with every other flag |
| `weekday: true` | `w` | prepend the localized day of the week |
| `dateStyle: 'short'` / `'long'` | `d` / `D` | short (`17.03.22`) or long (`March 17, 2022`) date |
| `timeStyle: 'short'` / `'long'` | `t` / `T` | short (`22:45`) or long (`22:45:00`) time |

mix `weekday` / `dateStyle` / `timeStyle` freely; flag order is composed for you. setting `relative: true` alongside any other flag throws `RangeError`

## joining

### `join(parts, separator?)` / `joinWithEntities(parts, separator?)`

`Array.prototype.join` for `Formatted` values — preserves entities across the pieces. `null` / `undefined` / `false` parts are dropped silently:

```ts
const items = ['alpha', 'beta', 'gamma']

format`pick: ${join(items.map(s => bold(s)), ', ')}`
```

`joinWithEntities` is an alias of `join`. the separator defaults to `''`, and both the parts and the separator accept strings, numbers, or `Formatted` values

## see also

- [overview](/plugins/markup/) — install + the `format` / `formatDedent` entry templates
- [parsers](/plugins/markup/parsers) — build a `Formatted` from an existing html or markdown string
- [codec](/plugins/markup/codec) — hydrate from a message and serialize back to source
- [keyboards](/guide/telegram/keyboards) — the other major message-building surface
