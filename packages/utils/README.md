# @puregram/utils

`@puregram/utils` package is almost useful utilities for `puregram` package!

## Installation
> **[Node.js](https://nodejs.org/) 12.0.0 or newer is required**

### Yarn
```bash
yarn add @puregram/utils
```

### NPM
```bash
npm i @puregram/utils
```

## Example usage
```js
import { Telegram } from 'puregram';
import { getCasinoValues } from '@puregram/utils';

const telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.on('message', (context) => {
  if (context.dice !== undefined && context.dice.emoji === '🎰') {
    // for example, user has got seven, bar, grapes
    console.log(getCasinoValues(context.dice.value)); // ['seven', 'bar', 'grapes']
  }
});

telegram.updates.startPolling().catch(console.error);
```
