<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#typescript-usage'><b>typescript usage</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#list-of-methods--getters'><b>methods & getters</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/puregram'><b>telegram channel</b></a>
</div>

## @puregram/scenes

_simple implementation of middleware-based scene management for `puregram` package_

### introduction

`@puregram/scenes` helps you to organize step-by-step handler by providing you needed classes and methods

### example

```js
const { Telegram } = require('puregram')

// @puregram/scenes requires @puregram/session
const { SessionManager } = require('@puregram/session')
const { SceneManager, StepScene } = require('@puregram/scenes')

const telegram = Telegram.fromToken(process.env.TOKEN)

const sessionManager = new SessionManager()
const sceneManager = new SceneManager()

telegram.updates.on('message', sessionManager.middleware)

telegram.updates.on('message', sceneManager.middleware)
telegram.updates.on('message', sceneManager.middlewareIntercept) // default scene entry handler

telegram.updates.on('message', (context) => {
  if (/^\/signup$/i.test(context.text)) {
    return context.scene.enter('signup')
  }
})

sceneManager.addScenes([
  new StepScene('signup', [
    (context) => {
      if (context.scene.step.firstTime || !context.hasText()) {
        return context.send('what\'s your name?')
      }

      context.scene.state.firstName = context.text

      return context.scene.step.next()
    },

    (context) => {
      if (context.scene.step.firstTime || !context.hasText()) {
        return context.send('how old are you?')
      }

      context.scene.state.age = Number.parseInt(context.text, 10)

      return context.scene.step.next()
    },

    async (context) => {
      const { firstName, age } = context.scene.state

      await context.send(`you are ${firstName} ${age} years old!`)

      // automatic exit since this is the last scene
      return context.scene.step.next()
    }
  ])
])

telegram.updates.startPolling()
```

### installation

```sh
$ yarn add @puregram/scenes
$ npm i -S @puregram/scenes
```

---

## typescript usage

you can tell `@puregram/scenes` about actual context type by providing it in the `StepScene<T>`:

```ts
import { CallbackQueryContext } from 'puregram'

new StepScene<CallbackQueryContext>('foo', [])
```

also, you can change context type on the fly simply by providing new type to the `context` variable:

```ts
import { CallbackQueryContext, MessageContext } from 'puregram'

new StepScene('bar', [
  (context: CallbackQueryContext) => {},
  (context: MessageContext) => {}
])
```

---

## list of methods & getters

### `context.scene`

#### `step`

_returns_: `SceneInterface | undefined`

returns current scene step

#### `enter(slug, options?)`

_returns_: `Promise<void>`

enters to another scene by `slug`

```js
context.scene.enter('signup')
```

#### `leave(options?)`

_returns_: `Promise<void>`

leaves from current scene

```js
context.scene.leave()
```

#### `reenter()`

_returns_: `Promise<void>`

reenters into current scene

```js
context.scene.reenter()
```

#### `reset()`

_returns_: `void`

resets current scene (deletes it)

### `context.scene.step`

#### `firstTime`

_returns_: `boolean`

returns `true` if this entry is the first entry in this scene

```js
if (context.scene.step.firstTime) { /* ... */ }
```

#### `stepId`

_returns_: `number`

returns current step ID

#### `current`

_returns_: `StepSceneHandler | undefined`

returns current step handler

#### `reenter()`

_returns_: `Promise<void>`

reenters into current step handler

```js
if (value.invalid) {
  return context.scene.step.reenter()
}
```

#### `go(stepId, options?)`

_returns_: `Promise<void>`

goes to a specific step by `stepId`

```js
context.scene.step.go(0)
```

#### `next(options?)`

_returns_: `Promise<void>`

goes to the next step

```js
context.scene.step.next()
```

#### `previous(options?)`

_returns_: `Promise<void>`

goes to the previous step

```js
context.scene.step.previous()
```
