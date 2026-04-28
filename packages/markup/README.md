# @puregram/markup

> v3 alpha — work in progress.

entity-based text formatting for puregram v3. produces telegram message entities directly, never relies on `parse_mode`.

```ts
import { Telegram } from 'puregram'
import { markup, format, bold, italic, html, md, join } from '@puregram/markup'

const tg = Telegram.fromToken(TOKEN).extend(markup())

await tg.api.sendMessage({
  chat_id: CHAT,
  text: format`Hello, ${bold('world')}! ${italic`How are you?`}`
})

await tg.api.sendMessage({
  chat_id: CHAT,
  text: html`Welcome <b>${userName}</b>! Visit <a href="https://x.com">our site</a>.`
})
```

## composers

- `format\`...\`` — strips the first indent, preserves nested staircase
- `formatDedent\`...\`` — strips every leading whitespace run
- `join(parts, sep?)` — merge an array of strings/Formatted with a separator (defaults to `''`)

## builders

modifier (chainable, callable as function or tagged template):
`bold`, `italic`, `underline`, `strikethrough`, `spoiler`, `blockquote`, `expandableBlockquote`, `code`.

```ts
bold('foo')                          // Formatted: bold over 'foo'
bold.italic('foo')                   // bold AND italic
bold`hi ${italic`there`}`            // bold over the whole, italic on 'there'
italic.bold('x')                     // chain order is preserved in entity emission order
```

field-required (function-only):
`link(text, url)`, `textMention(text, user)`, `customEmoji(emoji, id)`, `pre(text, lang?)`, `mentionUser(text, id)`, `mentionBot(text, id)`.

## parsers

`html\`\`` / `html(...)` — telegram's HTML parse_mode tags + a few aliases (`<strong>`, `<em>`, `<italic>`, `<ins>`, `<strike>`, `<del>`, `<spoiler>`, `<emoji>`). whitespace collapses like real HTML.

`htmlb\`\`` / `htmlb(...)` — same but `<br>` ↦ `\n`. use when authoring multi-line HTML in source.

`md\`\`` / `md(...)` (alias `markdown`) — MarkdownV2-flavored dialect with full entity coverage including `||spoiler||`, `> quote`, and `>> expandable quote`.

in tagged-template form, **string interpolations are literal text** (no parsing, no escaping needed). only the outer literal is parsed.

```ts
html`Hello, <b>${userName}</b>!` // userName cannot inject tags
md`Read **${title}** now`         // title is appended as plain text inside the bold span
```

## plugin

`markup()` registers an `onBeforeRequest` hook that auto-unwraps `Formatted` instances at every Bot API param slot paired with a `*_entities` field. Detection is schema-driven from `@puregram/api`.

## license

WTFPL
