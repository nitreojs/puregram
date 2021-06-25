<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#typescript-usage'><b>TypeScript usage</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#list-of-methods--getters'><b>Methods & getters</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/puregram_channel'><b>Channel</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://github.com/nitreojs/puregram#faq'><b>FAQ</b></a>
</div>

## @puregram/scenes

_Simple implementation of middleware-based scene management for `puregram` package_

### Introduction

`@puregram/scenes` helps you to organize step-by-step handler by providing you needed classes and methods

### Example
```js
const { Telegram } = require('puregram');

// @puregram/scenes requires @puregram/session
const { SessionManager } = require('@puregram/session');
const { SceneManager, StepScene } = require('@puregram/scenes');

const telegram = new Telegram({
  token: process.env.TOKEN
});

const sessionManager = new SessionManager();
const sceneManager = new SceneManager();

telegram.updates.on('message', sessionManager.middleware);

telegram.updates.on('message', sceneManager.middleware);
telegram.updates.on('message', sceneManager.middlewareIntercept); // Default scene entry handler

telegram.updates.on('message', (context) => {
  if (/^\/signup$/i.test(context.text)) {
    return context.scene.enter('signup');
  }
});

sceneManager.addScenes([
  new StepScene('signup', [
    (context) => {
      if (context.scene.step.firstTime || !context.hasText) {
        return context.send('What\'s your name?');
      }

      context.scene.state.firstName = context.text;

      return context.scene.step.next();
    },

    (context) => {
      if (context.scene.step.firstTime || !context.hasText) {
        return context.send('How old are you?');
      }

      context.scene.state.age = Number.parseInt(context.text, 10);

      return context.scene.step.next();
    },

    async (context) => {
      const { firstName, age } = context.scene.state;

      await context.send(`You are ${firstName} ${age} years old!`);

      // Automatic exit, since this is the last scene
      return context.scene.step.next();
    }
  ])
]);

telegram.updates.startPolling();
```

### Installation

```sh
$ yarn add @puregram/scenes
$ npm i -S @puregram/scenes
```

---

## TypeScript usage

You can tell `@puregram/scenes` about actual context type by providing it in the `StepScene<T>`:

```ts
import { CallbackQueryContext } from 'puregram';

new StepScene<CallbackQueryContext>('foo', []);
```

Also, you can change context type on the fly simply by providing new type to the `context` variable:

```ts
import { CallbackQueryContext, MessageContext } from 'puregram';

new StepScene('bar', [
  (context: CallbackQueryContext) => {},
  (context: MessageContext) => {}
]);
```

---

## List of methods & getters

### `context.scene`

#### `step`

_Returns_: `SceneInterface | undefined`

Returns current scene step

#### `enter(slug, options?)`

_Returns_: `Promise<void>`

Enters to another scene by `slug`

```js
return context.scene.enter('signup');
```

#### `leave(options?)`

_Returns_: `Promise<void>`

Leaves from current scene

```js
return context.scene.leave();
```

#### `reenter()`

_Returns_: `Promise<void>`

Reenters into current scene

```js
return context.scene.reenter();
```

#### `reset()`

_Returns_: `void`

Resets current scene (deletes it)

### `context.scene.step`

#### `firstTime`

_Returns_: `boolean`

Returns `true` if this entry is the first entry in this scene

```js
if (context.scene.step.firstTime) { /* ... */ }
```

#### `stepId`

_Returns_: `number`

Returns current step ID

#### `current`

_Returns_: `StepSceneHandler | undefined`

Returns current step handler

#### `reenter()`

_Returns_: `Promise<void>`

Reenters into current step handler

```js
if (value.invalid) {
  return context.scene.step.reenter();
}
```

#### `go(stepId, options?)`

_Returns_: `Promise<void>`

Goes to a specific step by `stepId`

```js
return context.scene.step.go(0);
```

#### `next(options?)`

_Returns_: `Promise<void>`

Goes to the next step

```js
return context.scene.step.next();
```

#### `previous(options?)`

_Returns_: `Promise<void>`

Goes to the previous step

```js
return context.scene.step.previous();
```
