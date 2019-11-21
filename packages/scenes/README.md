# @puregram/scenes

Puregram scenes - simple implementation of middleware-based scene management 🎬

## Installation
> **[Node.js](https://nodejs.org/) 8.0.0 or newer is required**  

### Yarn
```
yarn add @puregram/scenes
```

### NPM
```
npm i @puregram/scenes
```

## Example usage
```js
let { Telegram } = require('puregram');

// Session implementation can be any
let { SessionManager } = require('@puregram/session');
let { SceneManager, StepScene } = require('@puregram/scenes');

let telegram = new Telegram({
	token: process.env.TOKEN,
});

let sessionManager = new SessionManager();
let sceneManager = new SceneManager();

sceneManager.addScene(
  new StepScene('signup', [
    (context) => {
      if (context.scene.step.firstTime || !context.text) {
        return context.send('What\'s your name?');
      }

      context.scene.state.firstName = context.text;

      return context.scene.step.next();
    },
    (context) => {
      if (context.scene.step.firstTime || !context.text) {
        return context.send('How old are you?');
      }

      context.scene.state.age = Number(context.text);

      return context.scene.step.next();
    },
    async (context) => {
      let { firstName, age } = context.scene.state;

      await context.send(`👤 ${firstName} ${age} ages`);

      await context.scene.leave();
    }
  ])
);

telegram.updates.on('message', sessionManager.middleware);
telegram.updates.on('message', sceneManager.middleware);

// You can set default handler to your messages
// telegram.updates.on('message', sceneManager.middlewareIntercept);

telegram.updates.on('message', (context) => {
  if (context.text === '/signup') {
    return context.scene.enter('signup');
  }
});

telegram.updates.start().catch(console.error);
```

## Implementation
Implementation by [Negezor](https://github.com/negezor)
