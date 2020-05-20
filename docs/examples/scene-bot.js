// Code by Negezor (https://github.com/negezor)

let { Telegram } = require('puregram');

let { SessionManager } = require('@puregram/session');
let { SceneManager, StepScene } = require('@puregram/scenes');

let telegram = new Telegram({
  token: process.env.TOKEN
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

    (context) => {
      let { firstName, age } = context.scene.state;

      context.send(`👤 ${firstName} ${age} ages`);

      return context.scene.leave();
    }
  ])
);

telegram.updates.on('message', sessionManager.middleware);
telegram.updates.on('message', sceneManager.middleware);
telegram.updates.on('message', sceneManager.middlewareIntercept);

telegram.updates.hear('/signup', async (context) => {
  await context.scene.enter('signup');
});

telegram.updates.startPolling().then(
  () => console.log('Started polling')
).catch(console.error);
