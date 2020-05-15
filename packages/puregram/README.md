# puregram

Puregram is a powerful Node.js package that allows you to work with Telegram API 🚀

## Installation
> **[Node.js](https://nodejs.org/) 8.0.0 or newer is required**  

### Yarn
```
yarn add puregram
```

### NPM
```
npm i puregram
```

## Example usage
```js
let { Telegram } = require('puregram');

let telegram = new Telegram({
  token: process.env.TOKEN,
});

telegram.updates.on('message', context => context.send('Hi!'));

telegram.updates.startPolling();

console.log('Started polling');
```

## Community
### Packages that may be useful to you

* [@puregram/session](../session): Simple implementation of the sessions
* [@puregram/scenes](../scenes): Simple implementation of middleware-based scene management

> If you want to add your module in the list, create a [new issue](https://github.com/nitreojs/puregram/issues/new) in the repository.

## Thanks to
Biggest thanks to [Negezor](https://github.com/negezor) for his [vk-io](https://github.com/negezor/vk-io) library that helped me with this package!

### VK chat
> https://vk.me/join/AJQ1d7n35xXnfBxIB21zACP3
