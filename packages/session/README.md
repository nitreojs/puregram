puregram<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#typescript-usage'><b>TypeScript usage</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/puregram_channel'><b>Channel</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://github.com/nitreojs/puregram#faq'><b>FAQ</b></a>
</div>

## @puregram/session

_Simple implementation of sessions for `puregram` package_

### Introduction

With `@puregram/session` you can set up your own session for each active user and store some data in it

### Example
```js
const { Telegram } = require('puregram');
const { SessionManager } = require('@puregram/session');

const telegram = new Telegram({
  token: process.env.TOKEN
});

const sessionManager = new SessionManager();

telegram.updates.on('message', sessionManager.middleware);

telegram.updates.on('message', (context) => {
  const { session } = context;

  if (!session.counter) session.counter = 0;

  session.counter += 1;

  return context.send(`You called the bot ${session.counter} times!`);
});

telegram.updates.startPolling();
```

### Installation

```sh
$ yarn add @puregram/session
$ npm i -S @puregram/session
```

---

## TypeScript usage

You can extend `getStorageKey`'s `ContextInterface` by providing extra data interface into `SessionManager<T>`:

```ts
import { SessionManager } from '@puregram/session';

const manager = new SessionManager<{ test: boolean }>();
```
