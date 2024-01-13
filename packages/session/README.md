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

_simple implementation of sessions for `puregram` package_. shortly, `puregram` sessions available to everyone!

### introduction

with `@puregram/session` you can set up your own session for each active user and store some data in it while the bot is running

you could even pass your own redis or other file-based storages to keep data between bot reloads!

### example

```js
const { Telegram } = require('puregram')

const { session } = require('@puregram/session')

const telegram = Telegram.fromToken(process.env.TOKEN)

// here we define sessions for each and every update
telegram.updates.use(session({
  initial: () => ({ counter: 0 }) // it will have { counter: 0 } by default
  // you can also use `context` in `initial`:
  // initial: (context) => ({ firstUpdateId: context.updateId ?? 0 })
}))

telegram.updates.on('message', (context) => {
  session.counter++

  return context.reply(`you called the bot ${session.counter} times!`)
})

telegram.updates.startPolling()
```

### installation

```sh
$ yarn add @puregram/session
$ npm i -S @puregram/session
```

### `ttl`

`@puregram/session` exposes a little `ttl` function that allows you to mark
a key as a key that will be deleted once a certain amount of milliseconds have passed

```js
const { ttl } = require('@puregram/session')

context.session.user = ttl(user, 300_000) // context.session.user will be deleted in 5 minutes if it is not updated

setTimeout(() => console.log(context.session.user), 301_000) // logs: undefined
```

once a key has been set as a ttl key, you can omit the `ttl` part and just update it as usual:

```js
context.session.user = newUser // key has been updated, ttl has been reset to 5 minutes
```

of course, you can remove ttl properties from a key by simply marking it as a 0ms ttl:

```js
context.session.user = ttl(user, 0) // context.session.user becomes a default non-ttl value

setTimeout(() => console.log(context.session.user), 500_000) // logs: user object
```

overall:

```js
context.session.counter = ttl(0, 5_000)                   // counter = 0, will expire in 5 seconds
context.session.counter += 1                              // counter = 1, instantly updated, ttl reset to 5 seconds
setTimeout(() => (context.session.counter += 1), 3_000)   // counter = 2, updated after 3 seconds, ttl reset to 5 seconds
setTimeout(() => (context.session.counter += 1), 10_000)  // counter = NaN, updated after 5 seconds -> deleted; undefined + 1 results in NaN
```

```js
context.session.counter = ttl(0, 5_000)                         // counter = 0
context.session.counter += 1                                    // counter = 1
context.session.counter = ttl(2, 0)                             // counter = 2
context.session.counter += 1                                    // counter = 3
setTimeout(() => console.log(context.session.counter), 50_000)  // logs: 3
```

---

## typescript usage

`@puregram/session` extends `puregram`'s `Context` with a `session` property by default, so you actually don't need to worry about
anything if you're good with basically `session: Record<string, any>`

```ts
import { session } from '@puregram/session'

telegram.updates.use(session())

telegram.updates.on('message', (context) => {
  // `context.session` is available without any additional types! magic, isnt it?
  context.session.meaningOfLife = 42 // shower thoughts
})
```

however, if you want to use sessions with more type precision, `@puregram/session` provides `SessionLayer<S>` interface
which will get you what you want

```ts
import type { Context, MessageContext } from 'puregram'
import { session, type SessionLayer } from '@puregram/session'

interface SessionData {
  counter: number
}

type MyContext<C extends Context> = C & SessionLayer<SessionData>

telegram.updates.use(session({
  initial: () => ({ counter: 0 })
}))

telegram.updates.on('message', (context: MyContext<MessageContext>) => {
  // `context.session` is `{ counter: number }`
  context.session.counter++

  // ...
})
```

---

## more specifically

currently `@puregram/session` exposes only a few options in `session` function itself:

- `initial(context)`, a function that will be called when the `context.session` is `undefined`
  - default is `() => ({})` (empty object)
- `getStorageKey(context)`, a function that returns a unique key for every user allowing to store it in the `storage`
  - default is `context => context.senderId.toString()`
- `storage`, a structure that implements `SessionStorage` that basically acts as a storage. what do you want me to explain?!
  - default is (internally implemented) `new MemoryStorage()` that keeps everything in RAM
