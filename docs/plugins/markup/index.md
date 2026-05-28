---
title: '@puregram/markup'
description: entity-based text formatting for puregram — composes the bot-api entities array directly, no parse_mode, no escaping bugs
---

# `@puregram/markup`

a tagged-template formatter that builds telegram's `entities` array **directly** instead of generating a `parse_mode` string. you compose `bold`, `italic`, links, mentions and the rest as values, and the result is a plain `{ text, entities }` payload that goes straight onto the wire

the win: there is no `parse_mode`, so there's nothing to escape. user input can't break out of formatting because nothing is ever re-parsed back into markdown or html

```ts
import { format, bold, italic, code } from '@puregram/markup'

format`hey! this ${bold('message')} is ${italic('formatted')} without ${code('parse_mode')}!`
```

## install

::: code-group

```sh [yarn]
yarn add @puregram/markup
```

```sh [npm]
npm i -S @puregram/markup
```

```sh [pnpm]
pnpm add @puregram/markup
```

:::

markup is a `.extend` plugin **and** a bag of imports. you call the builders by importing them directly — but to send a `Formatted` value to telegram you must register the plugin once, so the outgoing entity-unwrapping hook is installed:

```ts
import { Telegram } from 'puregram'
import { markup, format, bold, italic, code } from '@puregram/markup'

const tg = Telegram.fromToken(process.env.TOKEN!)
  .extend(markup())

tg.onMessage(message =>
  message.send(
    format`hey! this ${bold('message')} is ${italic('formatted')} without ${code('parse_mode')}!`
  )
)

await tg.startPolling()
```

`.extend(markup())` registers an `onBeforeRequest` hook that walks every outgoing api call and replaces any `Formatted` value sitting in a formattable field (`text`, `caption`, etc.) with its `{ text, entities }` pair. without it, a `Formatted` arrives at telegram as `[object Object]`

::: warning
the builders themselves work without the plugin — `bold('hi')` returns a `Formatted` no matter what. but **sending** one requires `.extend(markup())`, because that's what teaches the client how to unwrap it. install it once at startup and forget about it
:::

## the entry templates — `format` / `formatDedent`

`format` is the tagged template you reach for most. it interpolates builders and strips the leading indentation off the block, so you can write a multi-line message at the indent level of your code:

```ts
import { format, bold, italic } from '@puregram/markup'

const f = format`
  ${bold('build:')} ${italic('passing')}
  everything is green
`
```

it strips the **first** pack of indentation off every line, like `stripIndent` — extra nested indentation is preserved. `formatDedent` is the aggressive variant: it strips **every** leading whitespace run, like `stripIndents`

both return a `Formatted`. plain strings and numbers interpolate as literal text; a `null` / `undefined` / `false` interpolation is dropped; another `Formatted` (or a builder result) splices in with its entities merged

## what you get

| surface | what it is |
|---|---|
| [builders](/plugins/markup/builders) | `bold`, `italic`, `link`, `mentionUser`, `time`, `blockquote`, `join`, … — compose formatting as values |
| [parsers](/plugins/markup/parsers) | `html` / `htmlb` / `md` / `markdown` — turn an existing html or markdown string into a `Formatted` |
| [codec](/plugins/markup/codec) | `Formatted.fromMessage`, `toHtml()` / `toMarkdown()`, lenient parsing — hydrate, serialize, round-trip |

## see also

- [builders](/plugins/markup/builders) — the full builder catalog
- [parsers](/plugins/markup/parsers) — `html` / `md` and the interpolation model
- [codec](/plugins/markup/codec) — hydrate from a message, serialize back to source
- [formatting text](/guide/telegram/formatting-text) — the raw `parse_mode` path, for comparison
- [plugins & .extend](/guide/concepts/plugins) — how `tg.extend` works in general
