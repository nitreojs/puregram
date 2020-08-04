# @puregram/session

`@puregram/session` is the simple implementation of sessions for `puregram` package

## Installation
> **[Node.js](https://nodejs.org/) 12.0.0 or newer is required**

### Yarn
```
yarn add @puregram/session
```

### NPM
```
npm i @puregram/session
```

## Example usage
```ts
import { Telegram, MessageContext } from 'puregram';
import { SessionManager, SessionInterface } from '@puregram/session';
import { HearManager } from '@puregram/hear';

const telegram: Telegram = new Telegram({
  token: process.env.TOKEN
});

const sessionManager: SessionManager = new SessionManager();
const hearManager: HearManager<MessageContext> = new HearManager<MessageContext>();

telegram.updates.on('message', sessionManager.middleware);
telegram.updates.on('message', hearManager.middleware);

hearManager.hear(/^\/counter$/i, async (context: MessageContext & SessionInterface) => {
  const { session } = context;

  if (!session.counter) session.counter = 0;

  session.counter += 1;

  await context.send(`You called the bot ${session.counter} times!`);
});

telegram.updates.startPolling().catch(console.error);
```
