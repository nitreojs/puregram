<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#typescript-usage'><b>TypeScript usage</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/puregram'><b>Telegram channel</b></a>
</div>

## @puregram/prompt

_Basic prompt system implemetation for `puregram` package_

### Introduction

`@puregram/prompt` can ask user to send some message and will keep that message in `PromptAnswer.context` variable, which you can access and do whatever you want

### Example
```js
const { Telegram } = require('puregram');
const { PromptManager } = require('@puregram/prompt');

const telegram = new Telegram({
  token: process.env.TOKEN
});

const promptManager = new PromptManager();

telegram.updates.use(promptManager.middleware);

telegram.updates.on('message', (context) => {
  let nameAnswer;

  while (!nameAnswer || !nameAnswer.text) {
    nameAnswer = await context.prompt('Hey! Please, enter your name.')
  }

  const name = nameAnswer.text; // also accessible via `nameAnswer.context.text`

  let ageAnswer;

  while (!ageAnswer || !ageAnswer.text || Number.isNaN(+ageAnswer.text)) {
    ageAnswer = await context.prompt('Cool! Now please enter your age.');
  }

  const age = Number.parseInt(ageAnswer.text);

  return context.send(`You're welcome, ${name} ${age} y.o.!`);
});

telegram.updates.startPolling();
```

### Installation

```sh
$ yarn add @puregram/prompt
$ npm i -S @puregram/prompt
```

---

## TypeScript usage

You can extend context's properties by passing `PromptContext` into `Updates.on<T>`:

```ts
telegram.updates.on<PromptContext>('message', (context) => {
  /* Now you have access to `prompt` and `promptReply` methods via types! */
});
```
