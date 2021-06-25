<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#list-of-methods--getters'><b>Functions</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/puregram_channel'><b>Channel</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://github.com/nitreojs/puregram#faq'><b>FAQ</b></a>
</div>

## @puregram/utils

_Package, containing some useful utilities for `puregram` package_

### Introduction

This package exists only for one main reason: basically not everyone wants to have such utils as `getCasinoValues` and `<insert one more here>` when installing `puregram`, so these functions were moved to separated package

### Example
```js
const { Telegram } = require('puregram');
const { getCasinoValues } = require('@puregram/utils');

const telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.on('message', (context) => {
  if (context.hasDice && context.dice.emoji === '🎰') {
    console.log(getCasinoValues(context.dice.value)); // e.g. ['seven', 'bar', 'grapes']
  }
});

telegram.updates.startPolling();
```

### Installation

```sh
$ yarn add @puregram/utils
$ npm i -S @puregram/utils
```

---

## List of functions

### `getCasinoValues(value)`

_Returns_: `SlotMachineValue`

Returns an _array of `CasinoValue`_ detected by `value` in the dice

```js
if (context.hasDice && context.dice.emoji === '🎰') {
  return context.send(`You've got ${getCasinoValues(context.dice.value).join(', ')}!`);
}
```
