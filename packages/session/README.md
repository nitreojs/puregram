<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#typescript-usage'><b>typescript usage</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/pureforum'><b>telegram forum</b></a>
</div>

## @puregram/session

_simple implementation of sessions for `puregram` package_

### introduction

with `@puregram/session` you can set up your own session for each active user and store some data in it

### Example

```js
const { Telegram } = require('puregram')
const { SessionManager } = require('@puregram/session')

const telegram = Telegram.fromToken(process.env.TOKEN)

const sessionManager = new SessionManager()

telegram.updates.on('message', sessionManager.middleware)

telegram.updates.on('message', (context) => {
  const { session } = context

  if (!session.counter) session.counter = 0

  session.counter += 1

  return context.send(`you called the bot ${session.counter} times!`)
})

telegram.updates.startPolling()
```

### installation

```sh
$ yarn add @puregram/session
$ npm i -S @puregram/session
```

---

## typescript usage

you can extend `getStorageKey`'s `ContextInterface` by providing extra data interface into `SessionManager<T>`:

```ts
import { SessionManager } from '@puregram/session'

const manager = new SessionManager<{ test: boolean }>()
```
