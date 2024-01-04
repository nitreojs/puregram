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

all of the functions except those that require two or more arguments
can be called either via template strings or like basic functions

```js
// template strings
bold`foo ${italic`bar`}`

// parentheses
bold(italic('bar'))
```

there's literally no distinction between them, however if you are going
to do embedded markup, you should use template strings:

```js

// ✅ works
bold`foo ${italic`bar`}`
bold`${italic`bar`}`
bold(italic('bar'))

// ❌ does not work
bold(`foo ${italic('bar')}`)
bold(`${italic('foo')}`)
```

the last one does not work simply because javascript compiles `foo ${italic('bar')}` into a single string which becomes 'foo [object Object]' soo yeah

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

### `pre(text: string, language?: string)`

```js
pre('im cool')
```

```js
pre('im cool but in bash', 'sh')
```

### `link(text: string, url: string)`

```js
link('epic!', 'https://github.puregram.cool')
```

### `mentionUser(text: string, userId: number)`

```js
mentionUser('dude', 398859857)
```

### `mentionBot(text: string, userId: number)`

```js
mentionUser('robodude', telegram.bot.id)
```

### `textMention(text: string, user: Interfaces.TelegramUser)`

```js
mentionUser('dude', { id: 398859857, is_bot: false, first_name: 'dude' })
```

### `customEmoji(text: string, id: string)`

```js
customEmoji('😁', '...')
```
