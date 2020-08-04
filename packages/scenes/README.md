# @puregram/scenes

`@puregram/scenes` is the simple implementation of middleware-based scene management for `puregram` package

## Installation
> **[Node.js](https://nodejs.org/) 12.0.0 or newer is required**

### Yarn
```
yarn add @puregram/scenes
```

### NPM
```
npm i @puregram/scenes
```

## Example usage
```ts
import { Telegram, MessageContext } from 'puregram';

// @puregram/scenes requires @puregram/session
import { SessionManager } from '@puregram/session';
import { SceneManager, StepScene, StepContext } from '@puregram/scenes';

// We will also use @puregram/hear package
import { HearManager } from '@puregram/hear';

const telegram: Telegram = new Telegram({
  token: process.env.TOKEN
});

const sessionManager: SessionManager = new SessionManager();
const sceneManager: SceneManager = new SceneManager();
const hearManager: HearManager<MessageContext & StepContext> = new HearManager<MessageContext>();

telegram.updates.on('message', sessionManager.middleware);

telegram.updates.on('message', sceneManager.middleware);
telegram.updates.on('message', sceneManager.middlewareIntercept); // Default scene entry handler

// Initializing hearManager after sceneManager because we need to handle scenes
telegram.updates.on('message', hearManager.middleware);

hearManager.hear(/^\/signup$/i, (context: MessageContext & StepContext) => (
  context.scene.enter('signup')
));

sceneManager.addScenes([
  new StepScene<MessageContext & StepContext>('signup', [
    async (context: MessageContext & StepContext) => {
      if (context.scene.step.firstTime || !context.hasText) {
        return context.send('What\'s your name?');
      }

      context.scene.state.firstName = context.text;

      return context.scene.step.next();
    },

    async (context: MessageContext & StepContext) => {
      if (context.scene.step.firstTime || !context.hasText) {
        return context.send('How old are you?');
      }

      context.scene.state.age = Number.parseInt(context.text!, 10);

      return context.scene.step.next();
    },

    async (context: MessageContext & StepContext) => {
      const { firstName, age } = context.scene.state;

      await context.send(`You are ${firstName} ${age} years old!`);

      // Automatic exit, since this is the last scene
      return context.scene.step.next();
    }
  ])
]);

telegram.updates.startPolling().catch(console.error);
```
