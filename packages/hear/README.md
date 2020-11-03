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
```js
import { Telegram } from 'puregram';
import { HearManager } from '@puregram/hear';

const telegram = new Telegram({
  token: process.env.TOKEN
});

const hearManager = new HearManager();

telegram.updates.on('message', hearManager.middleware);

hearManager.hear(/^hello$/i, async (context) => {
  context.send('Hello, World!');
});

telegram.updates.startPolling().catch(console.error);
```
