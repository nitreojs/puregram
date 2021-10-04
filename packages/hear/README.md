<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#typescript-usage'><b>TypeScript usage</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/puregram'><b>Channel</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://github.com/nitreojs/puregram#faq'><b>FAQ</b></a>
</div>

## @puregram/hear

_Simple implementation of hearing messages system for `puregram` package_

### Introduction

`@puregram/hear` listens for every message that has `text` or `caption` property in it and checks if provided conditions coincides with the `text`/`caption` property

### Example
```js
const { Telegram } = require('puregram');
const { HearManager } = require('@puregram/hear');

const telegram = new Telegram({
  token: process.env.TOKEN
});

const hearManager = new HearManager();

telegram.updates.on('message', hearManager.middleware);

hearManager.hear(/^hello$/i, context => context.send('Hello, World!'));

telegram.updates.startPolling();
```

### Installation

```sh
$ yarn add @puregram/hear
$ npm i -S @puregram/hear
```

---

## TypeScript usage

In TypeScript, you kinda have to manually point `@puregram/hear` what context will be used as default by providing it in `HearManager<T>`:

```ts
import { Telegram, MessageContext } from 'puregram';
import { HearManager } from '@puregram/hear';

const telegram = new Telegram({
  token: process.env.TOKEN
});

const hearManager = new HearManager<MessageContext>();
```

Of course, you can override that later by pointing new context in `hear<T>` method:

```ts
import { CallbackQueryContext } from 'puregram';

hearManager.hear<CallbackQueryContext>(/some-regexp$/i, (context) => { /* ... */ });
```
