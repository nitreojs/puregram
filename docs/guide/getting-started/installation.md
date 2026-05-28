---
title: installation
description: get a bot token, install puregram, and configure esm
---

# installation

two things before you write any code: a bot token, and the package installed

## getting a token

every telegram bot needs a token — a secret string that authenticates your code as that bot's owner

1. open telegram and search for [@BotFather](https://t.me/BotFather)
2. send `/newbot` and follow the prompts (pick a name and a username ending in `bot`)
3. copy the token it gives you — looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

::: warning keep your token secret
anyone who has the token controls the bot entirely. never commit it to source — always read it from an environment variable or a gitignored config file
:::

## installing the package

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

## esm setup

puregram is esm-only. your project needs:

**node 22 or higher**

```sh
node --version   # should print v22.x.x or newer
```

**`"type": "module"` in your `package.json`:**

```json
{
  "type": "module"
}
```

if you use typescript, set `"module"` and `"moduleResolution"` in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

::: tip already esm?
if your project already has `"type": "module"` and targets node 22+, you're done — no extra steps
:::

::: info no cjs build
puregram ships no commonjs build. if your project uses `require()` today, you'll need to migrate to esm first. the node.js docs have a guide on [using esm](https://nodejs.org/api/esm.html)
:::

## see also

- [your first bot](/guide/getting-started/your-first-bot) — write and run a minimal bot in two minutes
