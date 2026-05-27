# introduction

puregram is a thin, type-safe wrapper around the [telegram bot api](https://core.telegram.org/bots/api).
it is **not** a framework — there is no built-in command router, scene manager or
fsm in core. those live in opt-in satellite packages.

## installation

::: code-group

```sh [yarn]
yarn add puregram
```

```sh [npm]
npm install puregram
```

```sh [pnpm]
pnpm add puregram
```

:::

requires node 22+ and esm (`"type": "module"`).

## your first bot

```ts
import { Telegram } from 'puregram'

const tg = Telegram.fromToken(process.env.TOKEN!)

tg.onMessage(message => message.send('hello!'))

await tg.startPolling()
```
