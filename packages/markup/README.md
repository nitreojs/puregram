<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/pureforum'><b>telegram forum</b></a>
</div>

## @puregram/markup

_simple yet powerful markup system for `puregram` package_

### introduction

you all know how you need to provide `parse_mode` every time you
send a message with a markdown or html, right? it might get a
little boring after first few hundreds of times, so i present
to you `@puregram/markup`!

### example

```js
const { format, bold, italic, code, hooks: formatHooks } = require('@puregram/markup')

const { Telegram } = require('puregram')

const telegram = Telegram.fromToken(process.env.TOKEN)

// we use hooks for this one
telegram.useHooks(formatHooks())

telegram.updates.on('message', (context) => {
  return context.send(
    format`hey! this ${bold('message')} is ${italic('formatted')} without ${code('parse_mode')}!`
  )
})

telegram.updates.startPolling()
```

### installation

```sh
$ yarn add @puregram/markup
$ npm i -S @puregram/markup
```

---

## usage

most of the functions can be used via template strings, basic ones
can be used via the, you know, parentheses

```js
// template strings
bold`foo ${italic`bar`}`

// parentheses
bold(`foo ${italic('bar')}`)
```

there's literally no distinction between them i suppose

also dont use **nested** template strings, they may have a few bugs

---

## available functions

### `bold(text: string)`

```js
bold('hey!')
```

```js
bold`hey!`
```

### `italic(text: string)`

```js
italic('hey!')
```

```js
italic`hey!`
```

### `code(code: string)`

```js
code('const x = 5')
```

```js
code`const x = 5`
```

### `underline(text: string)`

```js
underline('hey!')
```

```js
underline`hey!`
```

### `strikethrough(text: string)`

```js
strikethrough('hey!')
```

```js
strikethrough`hey!`
```

### `spoiler(text: string)`

```js
spoiler('hey!')
```

```js
spoiler`hey!`
```

### `mention(text: string)`

```js
mention('@username')
```

```js
mention`@username`
```

### `pre(text: TemplateStringsArray)`

```js
pre`const x = 5\nconst y = x ** 2`
```

### `pre(language?: string)(text: TemplateStringsArray)`

```js
pre('js')`const x = 5\nconst y = x ** 2`
```

### `link(url: string)(text: TemplateStringsArray)`

```js
link('github.puregram.cool')`epic!`
```

### `mentionUser(user: Interfaces.TelegramUser | Structures.User)(text: TemplateStringsArray)`

```js
mentionUser({ id: 123, is_bot: false, first_name: 'dude' })`dude`
```

### `customEmoji(id: string)(text: TemplateStringsArray)`

```js
customEmoji('...')`😁`
```
