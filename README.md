<!-- Inspired by prisma.io & Telegraf docs -->

<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<p align='center'>
  Powerful and epic overall,
  <code>puregram</code>
  allows you to
  <b>easily interact</b>
  with
  <a href='https://core.telegram.org/bots/api'>Telegram Bot API</a>
  via
  <a href='https://nodejs.org'>Node.js</a>/<a href='https://www.typescriptlang.org'>TypeScript</a>
  😎👍
</p>

<div align='center'>
  <a href='https://github.com/nitreojs/puregram/tree/master/docs'><b>Docs</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://github.com/nitreojs/puregram/tree/master/docs/examples'><b>Examples</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#typescript-usage'><b>TypeScript usage</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/puregram_chat'><b>Chat</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/puregram_channel'><b>Channel</b></a>
</div>

## Introduction

**First, what are Telegram bots?** [Telegram][telegram] has their own [bot accounts][telegram/bots]. **Bots** are special Telegram accounts that can be only accessed via code and were designed to handle messages, inline queries and callback queries automatically. _Users can interact with bots by sending them messages, commands and inline requests._

[telegram]: https://t.me
[telegram/bots]: https://core.telegram.org/bots

### Example

```js
const { Telegram } = require('puregram');

const bot = Telegram.fromToken(process.env.TOKEN);

bot.updates.on('message', context => context.reply('Hey!'));
bot.updates.on('callback_query', context => context.answerCallbackQuery());

bot.updates.startPolling();
```

More examples [here][examples]

[examples]: https://github.com/nitreojs/puregram/tree/master/docs/examples

---

## Table of Contents

- [Why `puregram`?](#why-puregram) _(very important!!)_
- [**Getting started**](#getting-started)
  - [Getting token](#getting-token)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Calling API methods](#calling-api-methods)
  - [Sending media](#sending-media)
  - [Using markdown (`parse_mode`)](#using-markdown)
  - [Keyboards (`reply_markup`)](#keyboards)
- [Bot information](#bot-information)
- [What are contexts?](#what-are-contexts)
- [`Context` and its varieties](#context-and-its-varieties)
- [Middlewares](#middlewares)
- [**TypeScript usage**](#typescript-usage)
- [**FAQ**](#faq)

---

## Why `puregram`?

- Written **by [nitreojs](https://github.com/nitreojs)** ⚠
- Very **cool** package name
- Package itself is **cool** _(at least I think so)_
- **Works** _(I guess)_
- I **understand** only about **20% of** my **code**
- Because **why not**?

That's why this package is **_epic_**

---

## Getting started

### Getting token

If you want to develop a bot, firstly you need to [create it][telegram/bots/botfather] via [@BotFather][botfather] and get token from it via `/newbot` command.

[telegram/bots/botfather]: https://core.telegram.org/bots#6-botfather
[botfather]: https://t.me/botfather

Token looks like this: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

### Installation

```sh
$ yarn add puregram
$ npm i -S puregram
```

### Usage

#### Initializing `Telegram` instance

Let's start with creating a `Telegram` instance:

```js
const { Telegram } = require('puregram');

const bot = new Telegram({
  token: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'
});
```

You can also initialize it via `Telegram.fromToken`:

```js
const bot = Telegram.fromToken('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
```

Now, we want to [get updates][getting-updates] from the bot. **How can we do it?**

#### Getting updates

There are only **two ways** of getting updates right now:

1. Polling via [`getUpdates` method][getUpdates]... or just using `puregram`'s built-in polling logic:

```js
bot.updates.startPolling();
```

2. Setting up a Webhook via [`setWebhook` method][setWebhook]:

```js
const { createServer } = require('http');

// you need to send this request only once
bot.api.setWebhook({
  url: 'https://www.example.com/'
});

const server = createServer(bot.updates.getWebhookMiddleware());

server.listen(8443, () => console.log('Started'));
```

Remember that there are only four accepted ports for now: `443`, `80`, `88` and `8443`. They are listed [here][setWebhook] under the **Notes** section.

More webhook examples are available [here][webhook-examples]

[getting-updates]: https://core.telegram.org/bots/api#getting-updates
[getUpdates]: https://core.telegram.org/bots/api#getupdates
[setWebhook]: https://core.telegram.org/bots/api#setwebhook
[webhook-examples]: https://github.com/nitreojs/puregram/tree/master/docs/examples/webhook

#### Handling updates

Now with this setup we can catch updates like this:

```js
bot.updates.on('message', context => context.reply('Yoooo!'));
```

_List of supported updates will be somewhere here when it's done_

#### Manual updates handling

_Available from 2.0.8-rc.2 and later_

If you want to handle updates by yourself, you can use `Updates.handleUpdate` method, which takes one argument and this argument is raw Telegram update:

```js
/** Let's pretend I am polling updates manually... */

const update = await getUpdate(...);

let context;

try {
  context = await bot.updates.handleUpdate(update);
} catch (error) {
  console.log('Update is not supported', update);
}

// Voila! Now you have the right context
// (or you don't if the event is not supported 😢)
```

### Calling API methods

There are **three ways** of calling Telegram Bot API methods:

1. Using the `bot.callApi(method, params?)` _(useful when new Bot API update is released and the package is not updated yet)_:

```js
const me = await bot.callApi('getMe');
```

2. Using `bot.api.method(params?)`:

```js
const me = await bot.api.getMe();
```

3. Using context methods:

```js
bot.updates.on('message', context => context.send('13² = 169! I mean 169, not 169!'));
```

### Sending media

`puregram` allows you to send your local media via path, `Buffer`, `Stream` and URLs.

```js
/** Let's imagine we have an image called puppy.jpg in this directory... */

const { createReadStream } = require('fs');

const path = './puppy.jpg';
const stream = createReadStream(path);
const buffer = getBuffer(path);
const url = 'https://puppies.com/random-puppy';

bot.updates.on('message', (context) => {
  context.sendPhoto(path, { caption: 'Puppy via path!' });
  context.sendDocument(stream, { caption: 'More puppies via stream!', filename: 'puppy.jpg' });
  context.sendPhoto(buffer, { caption: 'One more puppy via buffer!' });
  context.sendPhoto(url, { caption: 'Some random puppy sent using an URL!!!' });
});
```

This works for every method that can send media.

---

### Using markdown

If you want to use _Markdown_ or _HTML_, there are **two ways** of doing that:

1. Using built-in `HTML`, `Markdown` and `MarkdownV2` classes:

```js
const message = HTML.bold('Very bold, such HTML');
```

3. Writing tags manually as it is told [here][formatting-options]:

```js
const message = '*Very bold, such Markdown*';
```

[formatting-options]: https://core.telegram.org/bots/api#formatting-options

Anyways, after writing the text you **need** to add `parse_mode` field. There are also **two ways** of doing that _¯\\\_(ツ)\_/¯_:

3. Writing actual parse mode code _like a boss_:

```js
{ parse_mode: 'Markdown' }
```

7. Passing parse mode class _like a cheems_:

```js
{ parse_mode: HTML }
```

Final API request will look like this:

```js
const message = `Some ${HTML.bold('bold')} and ${HTML.italic('italic')} here`;

context.send(message, { parse_mode: HTML });
```

```js
context.send(`Imagine using _classes_ for parse mode, *lol*!`, { parse_mode: 'Markdown' });
```

<details>
  <summary><i>The truth...</i></summary>
  <br />
  <img src="https://i.imgur.com/x6EFfCH.png" />
</details>

More markdown examples are available [here][markdown]

[markdown]: https://github.com/nitreojs/puregram/tree/master/docs/examples/markdown

---

### Keyboards

`puregram` has built-in classes for creating basic, inline, force-reply etc. keyboards. They are pretty much easy to use and are definitely more comfortable than building a JSON.

#### `InlineKeyboard`, `Keyboard` and so on

To create a keyboard, you need to call `keyboard` method from the keyboard class you chose. This method accepts an array of button rows.

```js
const { InlineKeyboard, Keyboard } = require('puregram');

const keyboard = InlineKeyboard.keyboard([
  [ // first row
    InlineKeyboard.textButton({ // first row, first button
      text: 'Some text here',
      payload: 'Such payload'
    }),

    InlineKeyboard.textButton({ // first row, second button
      text: 'Some more text here',
      payload: { json: true }
    })
  ],

  [ // second row
    InlineKeyboard.urlButton({ // second row, first button
      text: 'Some URL button',
      url: 'https://example.com'
    })
  ]
]);
```

```js
// one-row keyboard with two buttons, no brackets for rows needed
const keyboard = Keyboard.keyboard([
  Keyboard.textButton('Some one-row keyboard'),
  Keyboard.textButton('with some buttons')
]);
```

#### Keyboard builders

There are also keyboard **builders** which are designed to be building a keyboard step by step:

```js
const { KeyboardBuilder } = require('puregram');

const keyboard = new KeyboardBuilder()
  .textButton('First row, first button')
  .row()
  .textButton('Second row, first button')
  .textButton('Second row, second button')
  .resize(); // keyboard will be much smaller
```

#### Sending keyboards

To send keyboard, you simply need to pass the generated value in `reply_markup` field:

```js
context.send('Look, here\'s a keyboard!', { reply_markup: keyboard });
```

More keyboards examples are available [here][keyboards]

[keyboards]: https://github.com/nitreojs/puregram/tree/master/docs/examples/keyboards

---

## Bot information

If you are using `puregram`'s built-in polling logic, after `Updates.startPolling()` is called you have access to `Telegram.bot` property:

```js
bot.updates.startPolling().then(
  () => console.log(`@${bot.bot.username} started polling!`)
  // yeah, `bot.bot`   ¯\_(ツ)_/¯
  // that's why I prefer naming `telegram` instead of `bot`
);
```

---

## What are contexts?

Context is a class, containing current `update` object and it's payload _(via `update[updateType]`)_. It is loaded with a ton of useful _(maybe?)_ getters and methods that were made to shorten your code while being same efficient and executing the same code.

```js
bot.updates.on('message', (context) => {
  const id = context.senderId;
  // is the same as
  const id = context.from?.id;
});

bot.updates.on('message', (context) => {
  context.send('Hey!');
  // equals to
  bot.api.sendMessage({
    chat_id: context.chat?.id,
    text: 'Hey!'
  });
});
```

Every context has `telegram` property, so you can call API methods almost everywhere if you have a context nearby.

```js
bot.updates.on('message', async (context) => {
  const me = await context.telegram.api.getMe();
});
```

---

## `Context` and its varieties

Every update in `puregram` is handled by a special context, which is detected via the update key.

Every context _(except for manually created ones and some that were created after methods like `sendMessage`)_ will have `updateId` and `update` properties.

| Property   | Required | Description                                                                   |
| ---------- | -------- | ----------------------------------------------------------------------------- |
| `updateId` | _No_     | Unique update ID. Used as an offset when getting new updates                  |
| `update`   | _No_     | Update object. Current context was created via `this.update[this.updateType]` |

For example, if we have the `message` update, we will get `MessageContext` on this update, `CallbackQueryContext` for `callback_query` update and so on.

Every context requires **one argument**:

```ts
interface ContextOptions {
  // main Telegram instance
  telegram: Telegram;

  // update type, e.g. 'message', 'callback_query'
  updateType: UpdateName;
  
  // whole update object
  // optional, allows user to do the `context.update` to get the whole update object
  update?: TelegramUpdate;

  // update ID, located at TelegramUpdate
  // optional, allows user to get this update's ID
  updateId?: number;
}
```

You can also create any context manually:

```js
const { MessageContext } = require('puregram');

const update = await getUpdate();
const context = new MessageContext({
  telegram: bot,
  update,
  updateType: 'message',
  updateId: update.update_id
});
```

Every context is listed [here][contexts]

[contexts]: https://github.com/nitreojs/puregram/tree/master/packages/puregram/src/contexts

---

## Middlewares

`puregram` uses middlewares, so you can use them to expand your `context` variables or measure other middlewares.

- `next()` is used to call the next middleware on the chain and wait until it's done

Measuring the time it takes to proceed the update:
```js
bot.updates.use(async (context, next) => {
  const start = Date.now();

  await next(); // next() is async, so we need to await it

  const end = Date.now();

  console.log(`${context.updateId ?? '[unknown]'} proceeded in ${end - start}ms`);
});
```

Extending the context:
```js
bot.updates.use((context, next) => {
  context.user = await getUser(context.senderId);

  return next();
});

bot.updates.on('message', (context) => {
  // here we can access property we made in the middleware
  return context.send(`Hey, ${context.user.name}!`);
});
```

---

## TypeScript usage

### Importing Telegram interfaces

All Telegram interfaces and method types are auto-generated and put in different files: `telegram-interfaces.ts` for interfaces and `methods.ts` + `api-methods.ts` for API methods. They all exist at the path `puregram/lib/`.

```ts
import { TelegramUpdate, TelegramMessage } from 'puregram/lib/telegram-interfaces';
import { SendDocumentParams } from 'puregram/lib/methods';
```

### Extending contexts

Surely enough, you can extend contexts with extra fields and properties you need by intersectioning base context with new properties.

```ts
interface ExtraData {
  name: string;
  id?: number;
}

/** ... */

bot.updates.use((context, next) => {
  const user = await getUser(context.senderId);

  bot.name = user.name;
  bot.id = user.id;

  return next();
});

/**
 * There are 2 ways of updating context's type:
 * 1. External type override:
 * `(context: MessageContext & ExtraData) => ...`
 * 2. Using generics:
 * `bot.updates.on<ExtraData>(...)`
 * 
 * Below I will be using the second way.
 */

bot.updates.on<ExtraData>('message', (context) => {
  assert(context.name !== undefined);
});
```

---

## FAQ

### `TypeError: Cannot read property '__scene' of undefined`

You are trying to use [`@puregram/scenes`][@scenes] or [`@puregram/hear`][@hear] with [`@puregram/session`][@session], but you're the confusing middlewares order.

You should firstly initialize `@puregram/session`'s middleware and only then initialize other middlewares, depending on it:

```js
const sessionManager = new SessionManager();
const hearManager = new HearManager();

// 1. Session middleware first
bot.updates.on('message', sessionManager.middleware);

// 2. Hear middleware second
bot.updates.on('message', hearManager.middleware);
```

### How do I enable debugging?

If you want to inspect out- and ingoing requests made by `puregram`, you will need to enable `DEBUG` environment variable so the package understands you are ready for logs.

#### How to enable `DEBUG`

| Type      | Example (Unix)           | Description                                     |
| --------- | ------------------------ | ----------------------------------------------- |
| `api`     | `DEBUG=puregram:api`     | Enables debugging API out- and ingoing requests |
| `updates` | `DEBUG=puregram:updates` | Enables debugging ingoing updates               |
| `*`       | `DEBUG=puregram:*`       | Enables debugging all of the listed types above |

##### cmd

```cmd
> set "DEBUG=puregram:*" & node index
```

##### PowerShell

```ps
> $env:DEBUG = "puregram:*"; node index
```

##### Linux

```sh
$ DEBUG=puregram:* node index
```

---

## Community

These packages are created by the `puregram` community _(and not only)_ and are expanding packages functionality _(I guess)_.

### Some official packages

- [`@puregram/hear`][@hear]: Simple implementation of hear system
- [`@puregram/scenes`][@scenes]: Simple implementation of middleware-based scene management
- [`@puregram/session`][@session]: Simple implementation of sessions
- [`@puregram/utils`][@utils]: _Almost_ useful utilities
- [`@puregram/prompt`][@prompt]: Basic prompt system implementation

[@hear]: https://github.com/nitreojs/puregram/tree/master/packages/hear
[@scenes]: https://github.com/nitreojs/puregram/tree/master/packages/scenes
[@session]: https://github.com/nitreojs/puregram/tree/master/packages/session
[@utils]: https://github.com/nitreojs/puregram/tree/master/packages/utils
[@prompt]: https://github.com/nitreojs/puregram/tree/master/packages/prompt

### Non-official ones

_Oh no, it's empty there..._ Maybe _you_ could add _your_ community package here?

---

## Thanks to

- [Negezor][negezor] ([negezor/vk-io][negezor/vk-io]) — for inspiration, package idea (!) and some code and implementation ideas

[negezor]: https://github.com/negezor
[negezor/vk-io]: https://github.com/negezor/vk-io
