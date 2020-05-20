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

telegram.updates.startPolling().then(
  () => console.log('Started polling')
);
```

## Community
### Packages that may be useful to you

* [@puregram/session](../session): Simple implementation of the sessions
* [@puregram/scenes](../scenes): Simple implementation of middleware-based scene management

> If you want to add your module in the list, create a [new issue](https://github.com/nitreojs/puregram/issues/new) in the repository.

### Bots that were made using puregram

* [QiwiBot](https://t.me/qiwionebot) - helps to work with [QIWI](https://qiwi.com) wallet
* [Magnit X](https://t.me/magnitxbot) - saves your money on payments in [Magnit](https://magnit.ru) shop
* [Telegram Anonym Chat](https://t.me/ruanon_bot) - anonymous chat with other people in Telegram

If you want to see your bot here — PM [me](https://t.me/nitrojs) _(I will add up to 10 bots here)_

## Thanks to
Biggest thanks to [Negezor](https://github.com/negezor) for his [vk-io](https://github.com/negezor/vk-io) library that helped me with this package!

### Chats
[VK chat](https://vk.me/join/AJQ1d7n35xXnfBxIB21zACP3)

[Telegram chat](https://t.me/puregram_chat)
