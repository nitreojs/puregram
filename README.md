# puregram

`puregram` is a powerful Node.js package that allows you to easily interact with [Telegram API](https://core.telegram.org/bots/api) 🚀

| [🤖 Examples](https://github.com/nitreojs/puregram/tree/master/docs/examples) | [📖 Documentation](https://github.com/nitreojs/puregram/tree/master/docs) |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |

## Features

* 100% [Telegram Bot API](https://core.telegram.org/bots/api) coverage
* Works with JavaScript and TypeScript
* Has **57** tests and all of them passes every build

## Installation
> **[Node.js](https://nodejs.org/) 12.0.0 or newer is required**

### Yarn
```bash
yarn add puregram
```

### NPM
```bash
npm i -S puregram
```

## Example usage

```js
import { Telegram } from 'puregram';

const telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.on('message', (context) => context.send('Hi!'));

telegram.updates.startPolling().catch(console.error);
```

## Community

### Packages that might be useful to you

- [**@puregram/hear**](https://github.com/nitreojs/puregram/tree/master/packages/hear): Simple implementation of hear system
- [**@puregram/scenes**](https://github.com/nitreojs/puregram/tree/master/packages/scenes): Simple implementation of middleware-based scene management
- [**@puregram/session**](https://github.com/nitreojs/puregram/tree/master/packages/session): Simple implementation of sessions
- [**@puregram/utils**](https://github.com/nitreojs/puregram/tree/master/packages/utils): _Almost_ useful utilities

## Thanks to
Biggest thanks to [Negezor](https://github.com/negezor) for his [vk-io](https://github.com/negezor/vk-io) library that helped me with this package!

## Social

- [**Official Telegram chat**](https://t.me/puregram_chat)
- [**Official Telegram channel**](https://t.me/puregram_channel)
