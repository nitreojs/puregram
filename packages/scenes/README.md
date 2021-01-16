# @puregram/scenes

`@puregram/scenes` is the simple implementation of middleware-based scene management for `puregram` package

## Installation
> **[Node.js](https://nodejs.org/) 12.0.0 or newer is required**

```sh
$ yarn add @puregram/scenes
$ npm i -S @puregram/scenes
```

## Example usage
```js
import { Telegram } from 'puregram';

// @puregram/scenes requires @puregram/session
import { SessionManager } from '@puregram/session';
import { SceneManager, StepScene } from '@puregram/scenes';

// We will also use @puregram/hear package
import { HearManager } from '@puregram/hear';

const telegram = new Telegram({
  token: process.env.TOKEN
});

const sessionManager = new SessionManager();
const sceneManager = new SceneManager();
const hearManager = new HearManager();

telegram.updates.on('message', sessionManager.middleware);

telegram.updates.on('message', sceneManager.middleware);
telegram.updates.on('message', sceneManager.middlewareIntercept); // Default scene entry handler

// Initializing hearManager after sceneManager because we need to handle scenes
telegram.updates.on('message', hearManager.middleware);

hearManager.hear(/^\/signup$/i, (context) => context.scene.enter('signup'));

sceneManager.addScenes([
  new StepScene('signup', [
    async (context) => {
      if (context.scene.step.firstTime || !context.hasText) {
        return context.send('What\'s your name?');
      }

      context.scene.state.firstName = context.text;

      return context.scene.step.next();
    },

    async (context) => {
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

telegram.updates.startPolling().catch(console.error);
```
