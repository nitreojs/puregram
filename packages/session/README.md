# @puregram/session

`@puregram/session` is the simple implementation of sessions for `puregram` package

## Installation
> **[Node.js](https://nodejs.org/) 12.0.0 or newer is required**

```sh
$ yarn add @puregram/session
$ npm i -S @puregram/session
```

## Example usage
```js
import { Telegram } from 'puregram';
import { SessionManager } from '@puregram/session';
import { HearManager } from '@puregram/hear';

const telegram = new Telegram({
  token: process.env.TOKEN
});

const sessionManager = new SessionManager();
const hearManager = new HearManager();

telegram.updates.on('message', sessionManager.middleware);
telegram.updates.on('message', hearManager.middleware);

hearManager.hear(/^\/counter$/i, async (context) => {
  const { session } = context;

  if (!session.counter) session.counter = 0;

  session.counter += 1;

  await context.send(`You called the bot ${session.counter} times!`);
});

telegram.updates.startPolling().catch(console.error);
```
