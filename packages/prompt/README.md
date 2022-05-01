<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#typescript-usage'><b>typescript usage</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/puregram'><b>telegram channel</b></a>
</div>

## @puregram/prompt

_basic prompt system implemetation for `puregram` package_

### introduction

`@puregram/prompt` can ask user to send some message and will keep that message in `PromptAnswer.context` variable, which you can access and do whatever you want

### example

```js
const { Telegram } = require('puregram')
const { PromptManager } = require('@puregram/prompt')

const telegram = Telegram.fromToken(process.env.TOKEN)

const promptManager = new PromptManager()

telegram.updates.use(promptManager.middleware)

telegram.updates.on('message', (context) => {
  let nameAnswer

  while (!nameAnswer || !nameAnswer.text) {
    nameAnswer = await context.prompt('hey! please, enter your name')
  }

  const name = nameAnswer.text // also accessible via `nameAnswer.context.text`

  let ageAnswer

  while (!ageAnswer || !ageAnswer.text || Number.isNaN(+ageAnswer.text)) {
    ageAnswer = await context.prompt('cool! now please enter your age')
  }

  const age = Number.parseInt(ageAnswer.text)

  return context.send(`you're welcome, ${name} ${age} y.o.!`)
});

telegram.updates.startPolling()
```

### installation

```sh
$ yarn add @puregram/prompt
$ npm i -S @puregram/prompt
```

---

## typescript usage

you can extend context's properties by passing `PromptContext` into `Updates.on<T>`:

```ts
telegram.updates.on<PromptContext>('message', (context) => {
  /* now you have access to `prompt` and `promptReply` methods via types! */
})
```
