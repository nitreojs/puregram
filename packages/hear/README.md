# @puregram/hear

`@puregram/hear` is the simple implementation of hear system for `puregram` package

## Installation
> **[Node.js](https://nodejs.org/) 12.0.0 or newer is required**

### Yarn
```
yarn add @puregram/hear
```

### NPM
```
npm i @puregram/hear
```

## Example usage
```ts
import { Telegram, MessageContext } from 'puregram';
import { HearManager } from '@puregram/hear';

const telegram: Telegram = new Telegram({
  token: process.env.TOKEN
});

const hearManager: HearManager = new HearManager<MessageContext>();

hearManager.hear(/^hello$/i, async (context: MessageContext) => {
  await context.send('Hello, World!');
});

telegram.updates.startPolling().catch(console.error);
```
