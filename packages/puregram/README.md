<!-- inspired by prisma.io & telegraf docs -->

<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<p align='center'>
  powerful and epic overall,
  <code>puregram</code>
  allows you to
  <b>easily interact</b>
  with
  <a href='https://core.telegram.org/bots/api'>telegram bot api</a>
  via
  <a href='https://nodejs.org'>node.js</a>
  😎👍
</p>

<div align='center'>
  <a href='https://github.com/nitreojs/puregram/tree/lord/docs/examples'><b>examples</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#typescript-usage'><b>typescript usage</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://forum.puregram.cool'><b>telegram forum</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#faq'><b>faq</b></a>
</div>

## introduction

**first, what are telegram bots?** [telegram][telegram] has their own [bot accounts][telegram/bots]. **bots** are special telegram accounts that can be only accessed via code and were designed to handle messages, inline queries and callback queries automatically. _users can interact with bots by sending them messages, commands and inline requests._

[telegram]: https://t.me
[telegram/bots]: https://core.telegram.org/bots

### example

```js
const { Telegram } = require('puregram')

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', context => context.reply('hey!'))

telegram.updates.startPolling()
```

> **note**
> you can find more examples [here][examples]

[examples]: https://github.com/nitreojs/puregram/tree/lord/docs/examples

---

## table of contents

- [why `puregram`?](#why-puregram) _(very important!)_
- [**getting started**](#getting-started)
  - [getting token](#getting-token)
  - [installation](#installation)
  - [usage](#usage)
  - [what is `UpdatesFilter`?](#what-is-updatesfilter)
  - [calling api methods](#calling-api-methods)
    - [`suppress`ing api errors](#suppressing-errors)
  - media
    - [sending media (`MediaSource`)](#sending-media)
    - [downloading media (`MediaSourceTo`)](#downloading-media)
    - [sending input media (`InputMedia`)](#sending-input-media)
  - [using markdown (`parse_mode`)](#using-markdown)
  - [keyboards (`reply_markup`)](#keyboards)
- [bot information](#bot-information)
- [what are contexts?](#what-are-contexts)
- [action controller](#action-controller)
- [`Context` and its varieties](#context-and-its-varieties)
- [middlewares](#middlewares)
- [hooks](#hooks)
- [**typescript usage**](#typescript-usage)
- [**faq**](#faq)
- [ecosystem](#ecosystem)

---

## why `puregram`?

- written **by [starków](https://github.com/nitreojs)** ⚠
- powered **by [j++team](https://github.com/jppteam)** ⚠
- very **cool** package name
- package itself is **cool** _(at least i think so)_
- **works** _(i guess)_
- i **understand** only about **30%** of my **code**
- because **why not**?

---

## getting started

### getting token

if you want to develop a bot, firstly you need to [create it][telegram/bots/botfather] via [@botfather][botfather] and get token from it via `/newbot` command.

[telegram/bots/botfather]: https://core.telegram.org/bots#6-botfather
[botfather]: https://t.me/botfather

token looks like this: `123456:abc-def1234ghikl-zyx57w2v1u123ew11`

### installation

#### requirements

> node.js version must be greater or equal than **LTS** (`16.15.0` atm)

```sh
$ yarn add puregram
$ npm i -S puregram
```

### usage

#### initializing `Telegram` instance

let's start with creating a `Telegram` instance:

```js
const { Telegram } = require('puregram')

const bot = new Telegram({
  token: '123456:abc-def1234ghikl-zyx57w2v1u123ew11'
})
```

You can also initialize it via `Telegram.fromToken`:

```js
const bot = Telegram.fromToken('123456:abc-def1234ghikl-zyx57w2v1u123ew11')
```

now, we want to [get updates][getting-updates] from the bot. **how can we do it?**

#### getting updates

there are only **two ways** of getting updates right now:

1. polling via [`getUpdates` method][getUpdates]... or just using `puregram`'s built-in polling logic:

```js
telegram.updates.startPolling()
```

2. setting up a Webhook via [`setWebhook` method][setWebhook]:

```js
const { createServer } = require('http')

// you need to send this request only once
telegram.api.setWebhook({
  url: 'https://www.example.com/'
})

const server = createServer(telegram.updates.getWebhookMiddleware())

server.listen(8443, () => console.log('started'))
```

remember that there are only four accepted ports for now: `443`, `80`, `88` and `8443`. they are listed [here][setWebhook] under the **notes** section.

> **note**
> more webhook examples are available [here][webhook-examples]

[getting-updates]: https://core.telegram.org/bots/api#getting-updates
[getUpdates]: https://core.telegram.org/bots/api#getupdates
[setWebhook]: https://core.telegram.org/bots/api#setwebhook
[webhook-examples]: https://github.com/nitreojs/puregram/tree/lord/docs/examples/webhook

#### handling updates

now with this setup we can catch updates like this:

```js
telegram.updates.on('message', context => context.reply('yoo!'))
```

supported events are listed [here](https://github.com/nitreojs/puregram/tree/lord/docs/supported-events.md)

#### the `mergeMediaEvents`

if you've had to handle multiple attachments at once you'd know that in telegram every single attachment is a separate message. that makes it pretty hard for us to handle multiple attachs at once. here it comes - the `mergeMediaEvents` option in `Telegram`'s constructor

```js
const telegram = new Telegram({
  token: process.env.TOKEN,
  mergeMediaEvents: true
})
```

**what's changed?** if you'd set up a handler like this:

```js
telegram.updates.on('message', (context) => {
  console.log(context)
})
```

and then sent an album, you'd see that there will be some `mediaGroup` field in the `MessageContext`. that `mediaGroup` (instance of a `MediaGroup` class) contains some getters:

| getter        | type               | description                                                           |
| ------------- | ------------------ | --------------------------------------------------------------------- |
| `id`          | `string`           | media group's id                                                      |
| `contexts`    | `MessageContext[]` | list of received (and processed) contexts which contain an attachment |
| `attachments` | `Attachment[]`     | list of attachments mapped through `contexts` (described earlier)     |

```js
telegram.updates.on('message', (context) => {
  if (context.isMediaGroup()) {
    // INFO: all is* getters are methods in puregram@^2.9.0
    // INFO: if you are using puregram < 2.9.0, consider using `isMediaGroup` as a getter
    return context.reply(`this album contains ${context.mediaGroup.attachments.length} attachments!`)
  }
})
```

#### manual updates handling

if you want to handle updates by yourself, you can use `Updates.handleUpdate` method, which takes one argument and this argument is raw Telegram update:

```js
/** let's pretend i'm polling updates manually... */

const update = await getUpdate(...)

let context

try {
  context = telegram.updates.handleUpdate(update)
} catch (error) {
  console.log('update is not supported', update)
}

// voila! now you have the right context
// (or you don't if the event is not supported 😢)
```

### what is `UpdatesFilter`?

as mentioned in [`getUpdates`](https://core.telegram.org/bots/api#getupdates) documentation, 

> Specify an empty list to receive all update types **except `chat_member`** (default).
> If not specified, the previous setting will be used.

as you can see, you **have** to specify `chat_member` in order to receive `chat_member` updates...
but you also will have to specify **every single update type** that you're going to handle like this:

```js
{
  allowedUpdates: ['chat_member', 'message', 'callback_query', 'channel_post', 'edited_message', 'edited_channel_post', ...]
}
```

**not very convenient, is it?** that's why we've createed `UpdatesFilter`: a class containing a few static methods
that will allow you to **specify all update types** or even **exclude** some!

```js
const { Telegram, UpdatesFilter } = require('puregram')

const telegram = Telegram.fromToken(process.env.TOKEN, {
  allowedUpdates: UpdatesFilter.all()
})

// puregram will now handle every single update including `chat_member` and others (if they're listed under the `UpdateType` enum)
```

```js
const { Telegram, UpdatesFilter } = require('puregram')

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.startPolling({
  allowedUpdates: UpdatesFilter.except('callback_query')
})

telegram.updates.on('callback_query', (context) => {
  // this will never be called.

  return cry()
})
```

### calling api methods

there are **three ways** of calling telegram bot api methods:

1. using the `telegram.api.call(method, params?)` _(useful when new bot api update is released and the package is not updated yet)_:

```js
const me = await telegram.api.call('getMe')
```

2. using `telegram.api.method(params?)`:

```js
const me = await telegram.api.getMe()
```

3. using context methods:

```js
telegram.updates.on('message', context => context.send('13² = 169! well, i mean "169", not "169!"... fuck.'))
```

#### suppressing errors

sometimes you dont want to deal with the errors sent by the api,
sometimes you just dont want to create an empty `try/catch` statement for that.
this is where `suppress` parameter in the api call params comes in!
you can pass `suppress: true` to **any** api method and in case the error happens
`puregram` will not throw an error, but will return json object with `ok: false` and `error_code` and `description` properties.

##### `telegram.api` usage

```js
const result = await telegram.api.sendChatAction({
  chat_id: getRandomInt(1, 999_999_999),
  action: 'typing',
  suppress: true // <- the
})

// if the method was successfully executed, `result` will be `true`
// otherwise, a `{ ok: false, error_code: ..., description: ... }` object will be returned
// of course, there is a static method for that:
if (Telegram.isErrorResponse(result)) {
  // result is ApiResponseError
  // TODO: handle error
}

// result is true
```

##### `context` methods

```js
const result = await context.sendChatAction('typing', { suppress: true })

if (Telegram.isErrorResponse(result)) {
  return
}
```

### sending media

`puregram` allows you to send your local media by using `MediaSource` class.
you can put URLs, `Buffer`s, streams and paths in it.

```js
/** let's imagine we have an image called puppy.jpg in this directory... */

const { createReadStream } = require('fs')

const path = './puppy.jpg'
const stream = createReadStream(path)
const buffer = getBuffer(path)
const url = 'https://puppies.com/random-puppy'

telegram.updates.on('message', (context) => {
  await Promise.all([
    context.sendPhoto(MediaSource.path(path), { caption: 'puppy via path!' })
    context.sendDocument(MediaSource.stream(stream, { filename: 'puppy.jpg' }), { caption: 'more puppies via stream!' })
    context.sendPhoto(MediaSource.buffer(buffer), { caption: 'one more puppy via buffer!' })
    context.sendPhoto(MediaSource.url(url), { caption: 'some random puppy sent using an url!!!' })
  ])
})
```

this works for every method that can send media.

### downloading media

telegram bot api allows you to download any media you want by simply calling `getFile({ file_id })`,
extracting `file_path` from it and constructing a certain URL that you can then fetch and receive
the result, the final media.

that's a little **too much work** just for one file, isn't it? because of this, `puregram` has a mixin that allows just that.

```js
telegram.updates.on('message', async (context) => {
  if (!context.hasAttachmentType('photo')) {
    return
  }

  const buffer = await context.download()

  // just for sake of testing...
  return context.sendDocument(MediaSource.buffer(buffer, { filename: 'photo.png' }))
})
```

of course, you can download an attachment not only via `Buffer`s, but via `path` and a `stream`. we use `MediaSourceTo` (not `MediaSource`) for that.

##### `MediaSourceTo.path`, via path

```js
telegram.updates.on('message', async (context) => {
  if (!context.hasAttachmentType('photo')) {
    return
  }

  const PATH = resolve(__dirname, 'photo.png')

  // save a photo to {__dirname}/photo.png
  await context.download(MediaSourceTo.path(PATH))

  return context.sendDocument(MediaSource.path(PATH, { filename: 'photo.png' }))
})
```

##### `MediaSourceTo.stream`, via stream

```js
telegram.updates.on('message', async (context) => {
  if (!context.hasAttachmentType('photo')) {
    return
  }

  // process the photo via stream
  const stream = new PassThrough() // bidirectional stream

  await context.download(MediaSourceTo.stream(stream))

  return context.sendDocument(MediaSource.stream(stream, { filename: 'photo.png' }))
})
```

##### `MediaSourceTo.buffer`, via buffer

```js
telegram.updates.on('message', async (context) => {
  if (!context.hasAttachmentType('photo')) {
    return
  }

  const buffer = await context.download(MediaSourceTo.buffer())

  return context.sendDocument(MediaSource.buffer(buffer, { filename: 'photo.png' }))
})
```

#### more internal api

under the hood `context.download(...)` uses `telegram.downloadFile(...)` method. it can be called with either `file_id` or an attachment

##### `file_id` & `Buffer`

```js
const fileId = getFileIdSomehow()

const result = await telegram.downloadFile(fileId, MediaSourceTo.buffer())
```

##### `Attachment` & `path`

```js
const attachment = context.attachment

const PATH = resolve(__dirname, 'test.png')

const result = await telegram.downloadFile(attachment, MediaSourceTo.path(PATH))
```

### sending input media

some of the methods (like `editMessageMedia` or `sendMediaGroup`) require such objects
like `TelegramInputMediaPhoto`, `TelegramInputMediaVideo` and so on

`puregram` provides `InputMedia` class which allows you to easily map your `MediaSource` value to a piece of input media!

```js
const { InputMedia, MediaSource } = require('puregram')

telegram.api.editMessageMedia({
  chat_id: 398859857,
  message_id: 12345,
  media: InputMedia.document(MediaSource.path('./README.md'), {
    caption: 'Epic shit'
  })
})

context.sendMediaGroup([
  InputMedia.photo(MediaSource.path('./image.png')),
  InputMedia.video(MediaSource.url('https://example.com/path/to/video.mp4'), { caption: 'here goes caption' })
])
```

you can even use `InputMedia` on `context.sendMedia`!

```js
context.sendMedia(
  InputMedia.photo(MediaSource.path('./image.png'), { caption: 'EPIC!!❕❕❕❕❕❗️❗️' })
)
```

---

### using markdown

if you want to use _markdown_ or _html_, there are **two ways** of doing that:

1. using built-in `HTML`, `Markdown` and `MarkdownV2` classes:

```js
const message = HTML.bold('very bold, such html')
```

3. writing tags manually as it is told [here][formatting-options]:

```js
const message = '*very bold, such markdown*'
```

[formatting-options]: https://core.telegram.org/bots/api#formatting-options

anyways, after writing the text you **need** to add `parse_mode` field. there are ~~also **two ways**~~ actually, there are three ways of of doing that!

3. writing actual parse mode code _like a boss_:

```js
{ parse_mode: 'markdown' }
```

7. passing parse mode class _like a cheems_:

```js
{ parse_mode: HTML }
```

- passing a value from `ParseMode` enum _like a chad would do_:

```js
{ parse_mode: ParseMode.Markdown }
```

> **note**
> yeah also `ParseMode` can be imported from `puregram` natively:
> ```js
> const { ParseMode } = require('puregram')
> ```

final api request will look like this:

```js
const message = `some ${HTML.bold('bold')} and ${HTML.italic('italic')} here`

context.send(message, { parse_mode: HTML })
```

```js
context.send(`imagine using _classes_ for parse mode, *lol*!`, { parse_mode: 'markdown' })
```

<details>
  <summary><i>the truth...</i></summary>
  <br />
  <img src="https://i.imgur.com/x6EFfCH.png" />
  <br />
  <s>fuck this meme is obsolete now that i added <code>ParseMode</code> enum</s>
</details>

since markdown-v2 requires a lot of chars to be escaped, i've came up with a beautiful idea...

```js
const message = MarkdownV2.build`
  damn that's a cool usage of ${MarkdownV2.bold('template strings')}!
  ${MarkdownV2.italic('foo')} bar ${MarkdownV2.underline('baz')}
  starkow v3 when
`
```

> **note**
> more markdown examples are available [here][markdown]

[markdown]: https://github.com/nitreojs/puregram/tree/lord/docs/examples/markdown

---

### keyboards

`puregram` has built-in classes for creating basic, inline, force-reply etc. keyboards. they are pretty much easy to use and are definitely more comfortable than building a json.

#### `InlineKeyboard`, `Keyboard` and so on

to create a keyboard, you need to call `keyboard` method from the keyboard class you chose. this method accepts an array of button rows.

```js
const { InlineKeyboard, Keyboard } = require('puregram')

const keyboard = InlineKeyboard.keyboard([
  [ // first row
    InlineKeyboard.textButton({ // first row, first button
      text: 'some text here',
      payload: 'such payload'
    }),

    InlineKeyboard.textButton({ // first row, second button
      text: 'some more text here',
      payload: { json: true }
    })
  ],

  [ // second row
    InlineKeyboard.urlButton({ // second row, first button
      text: 'some url button',
      url: 'https://example.com'
    })
  ]
])
```

```js
// one-row keyboard with two buttons, no brackets for rows needed
const keyboard = Keyboard.keyboard([
  Keyboard.textButton('some one-row keyboard'),
  Keyboard.textButton('with some buttons')
]).resize()
```

> **note**
> starting from `puregram@2.14.0`, you can even use simple strings instead of `Keyboard.textButton`s!
>
> ```js
> // two-row keyboard with one button on each row via strings!
> const keyboard = Keyboard.keyboard([
>   [
>     'first row, one button'
>   ],
>   [
>     'second row, still one button!'
>   ]
> ]).resize()
> ```

#### keyboard builders

there are also keyboard **builders** which are designed to be building a keyboard step by step:

```js
const { KeyboardBuilder } = require('puregram')

const keyboard = new KeyboardBuilder()
  .textButton('first row, first button')
  .row()
  .textButton('second row, first button')
  .textButton('second row, second button')
  .resize() // keyboard will be much smaller
```

#### sending keyboards

to send keyboard, you simply need to pass the generated value in `reply_markup` field:

```js
context.send('look, here\'s a keyboard!', { reply_markup: keyboard })
```

> **Note**
> more keyboard examples are available [here][keyboards]

[keyboards]: https://github.com/nitreojs/puregram/tree/lord/docs/examples/keyboards

---

## bot information

if you are using `puregram`'s built-in polling logic, after `Updates.startPolling()` is called you have access to `Telegram.bot` property:

```js
telegram.updates.startPolling().then(
  () => console.log(`@${telegram.bot.username} started polling`)
)
```

---

## what are contexts?

`Context` is a class, containing current `update` object and it's payload _(via `update[updateType]`)_. it is loaded with a ton of useful _(maybe?)_ getters and methods that were made to shorten your code while being same efficient and executing the same code.

```js
telegram.updates.on('message', (context) => {
  const id = context.senderId
  // is the same as
  const id = context.from?.id
})
```

```js
telegram.updates.on('message', (context) => {
  context.send('hey!')
  // equals to
  telegram.api.sendMessage({
    chat_id: context.chat?.id,
    text: 'hey!'
  })
})
```

every context has `telegram` property, so you can call api methods almost everywhere if you have a context nearby.

```js
telegram.updates.on('message', async (context) => {
  const me = await context.telegram.api.getMe()
})
```

---

## action controller

`sendChatAction` is a method that requires to be called every **5** seconds
before the action is complete. but how do you actually implement that?

even the simplest solutions require some _hacky_ workarounds. that's why
`puregram` encapsulates these _hacks_ and you can use them right away,
even with a **controller**!

```js
telegram.updates.on('message', (context) => {
  // this thing will be sending `context.sendChatAction('typing')`
  // every 5 seconds until `controller.abort()` is called
  const controller = context.createActionController('typing')

  controller.start()

  await sleep(14_000) // just to make sure everything works

  controller.stop() // make sure to call that!!!

  return context.send('yeah so we are unable to deliver your message rn sorry')
})
```

of course, you are able to change `controller.action` and all the options mentioned below while the controller is running

#### `createActionController` options

| key        | type     | required? | default | description                                                                    |
| ---------- | -------- | --------- | ------- | ------------------------------------------------------------------------------ |
| `interval` | `number` | no        | `5000`  | Interval between `sendChatAction` calls, in milliseconds                       |
| `wait`     | `number` | no        | `0`     | Initial wait before the first cycle of `sendChatAction` calls, in milliseconds |
| `timeout`  | `number` | no        | `30000` | Timeout for `sendChatAction` calls, in milliseconds                            |

---

## `Context` and its varieties

every update in `puregram` is handled by a special context, which is detected via the update key.

every context _(except for manually created ones and some that were created after methods like `sendMessage`)_ will have `updateId` and `update` properties.

| property   | required | description                                                                   |
| ---------- | -------- | ----------------------------------------------------------------------------- |
| `updateId` | _no_     | unique update id. used as an offset when getting new updates                  |
| `update`   | _no_     | update object. current context was created via `this.update[this.updateType]` |

for example, if we have the `message` update, we will get `MessageContext` on this update, `CallbackQueryContext` for `callback_query` update and so on.

every context requires **one argument**:

```ts
interface ContextOptions {
  // main Telegram instance
  telegram: Telegram

  // update type, e.g. 'message', 'callback_query'
  updateType: UpdateName
  
  // whole update object
  // optional, allows user to do the `context.update` to get the whole update object
  update?: TelegramUpdate

  // update id, located at TelegramUpdate
  // optional, allows user to get this update's id
  updateId?: number
}
```

> **note**
> some contexts may be combined by a single structure because of how telegram bot api is built. **what does this mean?**
>
> simplest examples are [extra contexts](extra-events):
> their payload lies inside of `Message` structure itself, so they are naturally also `Message`s, meaning that they are also `MessageContext`s.
>
> ```js
> telegram.updates.on('forum_topic_created', (context) => {
>   // technically speaking, context is `ForumTopicCreatedContext`, but internally it was almost constructed
>   // into MessageContext because of the `forum_topic_created` property lying inside of `Message` so yeah
> })
> ```

you can also create any context manually:

```js
const { MessageContext } = require('puregram')

const update = await getUpdate()

const context = new MessageContext({
  telegram,
  update,
  updateType: 'message',
  updateId: update.update_id
})
```

> **note**
> every context is listed [here][contexts]

[contexts]: https://github.com/nitreojs/puregram/tree/lord/packages/puregram/src/contexts
[extra-events]: https://github.com/nitreojs/puregram/blob/lord/docs/supported-events.md#extra-events

---

## middlewares

`puregram` implements middlewares logic, so you can use them to expand your `context` variables or measure other middlewares.
`next()` is used to call the next middleware on the chain and wait until it's done

- measuring the time it takes to process the update:

```js
telegram.updates.use(async (context, next) => {
  const start = Date.now()

  await next() // next() is async, so we need to await it

  const end = Date.now()

  console.log(`${context.updateId ?? '[unknown]'} processed in ${end - start}ms`)
})
```

- extending the context:

```js
telegram.updates.use(async (context, next) => {
  context.user = await getUser(context.senderId)

  return next()
})

telegram.updates.on('message', (context) => {
  // here we can access property we made in the middleware
  return context.send(`hey, ${context.user.name}!`)
})
```

---

## hooks

since `v2.19.0`, `puregram` has **hooks** - a way to intercept the outgoing *(and ingoing soon)* requests
and manipulate data in them. this means that you can create such an interceptor that will, for example,
always add `parse_mode: 'html'` to your `sendMessage` calls, or even abort (cancel) the requests!

```js
telegram.onBeforeRequest((context) => {
  if (context.path === 'sendMessage') {
    context.params.parse_mode = 'html'
  }

  return context
})

telegram.updates.on('message', (context) => {
  return context.reply('this <b>will be</b> <i>parsed</i> correctly!')
})
```

### deeper into the ~~woods~~ hooks!

there are currently **five** hooks that you can use. each of them has their own set
of variables called *context*. **you need to return the same structure of an object that was given to you when you caught it**

each and every *context* has keys that the previous interceptor had. for example,
take this `BaseContext` that every other context extends off of:

| key          | type                 | description                                              |
| ------------ | -------------------- | -------------------------------------------------------- |
| `controller` | `AbortController`    | basic `AbortController`, allows to `abort()` the request |
| `init`       | `undici.RequestInit` | `fetch()`'s params object                                |

every context listed below will have those `controller` and `init` keys PLUS their own keys

hooks are listed below in order of their execution from top to bottom:

1. `onBeforeRequest`: this hook is processed when the API request has been just caught and is starting to set everything up

| key      | type                  | description                                |
| -------- | --------------------- | ------------------------------------------ |
| `path`   | `string`              | API method path, `sendMessage` for example |
| `params` | `Record<string, any>` | API method params                          |

2. `onRequestIntercept`: hook that is executed right before the API call happens to be processed

| key     | type     | description                              |
| ------- | -------- | ---------------------------------------- |
| `query` | `string` | URL query that was built by the `params` |
| `url`   | `string` | full API request URL                     |

3. API call. no hook for this, sorry!

4. `onResponseIntercept`: API call has succeeded (probably), `response` and `json` are yours to experiment with

| key        | type               | description                            |
| ---------- | ------------------ | -------------------------------------- |
| `response` | `undici.Response`  | HTTP response that came from API       |
| `json`     | `ApiResponseUnion` | HTTP response that morphed into JSON 👻 |

5. `onAfterRequest`: everything that has to be done had been done, literally cleaning time

*no additional keys are provided for `onAfterRequest`*

and one more, `onError`, which is covering the area between `onRequestIntercept` and `onAfterRequest` hooks

| key     | type    | description                   |
| ------- | ------- | ----------------------------- |
| `error` | `Error` | simply an error that happened |

### exporting hooks into packages

*... or, to put simply, "how do i export more than one hook and use it easily?"*

`puregram` provides `telegram.useHooks(hooks)` method that allows you to pass multiple hooks of different types
easily and instantly. this gradually helps importing several hooks at once if you're, for example, importing them
from another package:

```js
// lets pretend `hooks` is a function that returns `puregram.Hooks` object (will be discussed below)
import { hooks as imagination } from 'imaginary-package'

telegram.useHooks(imagination())

// ... that's literally it!
```

under the *imaginary* hood, `hooks` (a.k.a. `imagination` in this case) is a function (does not need to be a function though)
that returns `puregram.Hooks` interface - an object that you can import from `puregram/hooks`:

```ts
import { Hooks } from 'puregram/hooks'

export function imagination(): Hooks {
  return () => ({
    onBeforeRequest(context) { ... },
    onAfterRequest(context) { ... }
  })
}
```

*that's it!*

---

## typescript usage

### extending contexts

surely enough, you can extend contexts with extra fields and properties you need by intersectioning base context with new properties.

```ts
interface ExtraData {
  name: string
  id?: number
}

/** ... */

telegram.updates.use(async (context, next) => {
  const user = await getUser(context.senderId)

  context.name = user.name
  context.id = user.id

  return next()
})

/**
 * there are 2 ways of updating context's type:
 * 1. external type override:
 * `(context: MessageContext & ExtraData) => ...`
 * 2. using generics:
 * `telegram.updates.on<ExtraData>(...)`
 * 
 * below I will be using the second way.
 */

telegram.updates.on<ExtraData>('message', (context) => {
  assert(context.name !== undefined)
})
```

---

### importing Telegram interfaces

all Telegram interfaces and method types are auto-generated and put in different files: `telegram-interfaces.ts` for interfaces and `methods.ts` + `api-methods.ts` for api methods. they all exist at the paths `puregram/telegram-interfaces`, `puregram/methods` and `puregram/api-methods` respectively.
also there's a `puregram/generated` export which exports everything from `lib/generated` folder (all of those listed before).

```ts
import { TelegramUpdate, TelegramMessage } from 'puregram/generated'
```

```ts
import { SendDocumentParams } from 'puregram/generated'
```

```ts
import { CopyMessageParams } from 'puregram/methods'
import { InputFile, TelegramUpdate } from 'puregram/telegram-interfaces'
```

### type predicates

`puregram` implements [type predicates](typescript-type-predicates) (so-called *type guards*)
on some context methods (mostly on those that have `is`/`has`/`can` at the start of the field name) in order to
keep connection between types and actual values

```ts
telegram.updates.on('message', (context) => {
  const originalText = context.text
  // if we look at the `originalText`'s type we will see `string | undefined`

  // but luckily for us there is such type predicate as `hasText()` which tells typescript that `context.text` is definitely a `string`!
  if (context.hasText()) {
    const text = context.text
    // `text`'s type is now `string`. `undefined` is gone! hurray!!
  }
})
```

also, `Context.is` is also a type guard! this means that you can do this and get a proper context typing whenever you want:

```ts
if (context.is('callback_query')) {
  // context is now CallbackQueryContext
}
```

this is pretty useful when you have `context: Context` and especially convenient because you don't have to import
the right contexts just to do this boring thing:

```ts
if (context instanceof CallbackQueryContext) {
  // this sucks! context.is('callback_query') is better   👍😎👍
}
```

> **note**
> because of type guards, it was decided to transition all getters starting with `is`/`has`/`can` into methods in all structures.
> this means that if you see a field starting with aforementioned parts **you can be sure** that this is definitely a method
> and not a getter or a property!

[typescript-type-predicates]: https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates

## faq

### `TypeError: Cannot read property '__scene' of undefined`

you are trying to use [`@puregram/scenes`][@scenes] or [`@puregram/hear`][@hear] with [`@puregram/session`][@session], but you're confusing the middlewares order

you should firstly initialize `@puregram/session`'s middleware and only then initialize other middlewares, depending on it:

```js
const sessionManager = new SessionManager()
const hearManager = new HearManager()

// 1. session middleware first
telegram.updates.on('message', sessionManager.middleware)

// 2. hear middleware second
telegram.updates.on('message', hearManager.middleware)
```

### how do i enable debugging?

if you want to inspect out- and ingoing requests made by `puregram`, you will need to enable `DEBUG` environment variable so the package understands you are ready for logs.

#### how to enable `DEBUG`

| namespace   | example (unix)             | description                                                                       |
| ----------- | -------------------------- | --------------------------------------------------------------------------------- |
| `api`       | `DEBUG=puregram:api`       | enables debugging api out- and ingoing requests                                   |
| `api/getMe` | `DEBUG=puregram:api/getMe` | enables debugging `getMe` update (you can set whichever method you want to debug) |
| `updates`   | `DEBUG=puregram:updates`   | enables debugging ingoing updates                                                 |
| `all`       | `DEBUG=puregram:all`       | enables debugging all of the listed types above                                   |

##### cmd

```cmd
> set "DEBUG=puregram:all" & node index
```

##### powershell

```ps
> $env:DEBUG = "puregram:all"; node index
```

##### linux

```sh
$ DEBUG=puregram:all node index
```

### are there any telegram chats or channels?

totally! recently `puregram` has created its own forum! it has every topic needed and
will be expanding if it needs to!

if you ¯\\\_(ツ)_/¯ what to do and want to ask a question, **[@pureforum][pureforum] is definitely the way!**

[pureforum]: https://forum.puregram.cool

### why is your readme lowercased?

because i dont like doing anything that looks official so i do my own styling 😎

**btw did you see these issues?**
- https://github.com/nitreojs/puregram/issues/63
- https://github.com/nitreojs/puregram/issues/62

they confirm im against anything that looks kinda too official 😉

---

## ecosystem

these packages are created by the `puregram` community _(and not only)_ and are expanding packages functionality _(i guess)_.

### some official packages

- [`@puregram/hear`][@hear]: simple implementation of hear system
- [`@puregram/scenes`][@scenes]: simple implementation of middleware-based scene management
- [`@puregram/session`][@session]: simple implementation of sessions
- [`@puregram/utils`][@utils]: useful utilities
- [`@puregram/prompt`][@prompt]: basic prompt system implementation
- [`@puregram/callback-data`][@callback-data]: basic callback data validation and serialization
- [`@puregram/markup`][@markup]: simple yet powerful markup system
- [`@puregram/media-cacher`][@media-cacher]: cache sent media `file_id`s with ease!

[@hear]: https://github.puregram.cool/hear
[@scenes]: https://github.puregram.cool/scenes
[@session]: https://github.puregram.cool/session
[@utils]: https://github.puregram.cool/utils
[@prompt]: https://github.puregram.cool/prompt
[@callback-data]: https://github.puregram.cool/callback-data
[@markup]: https://github.puregram.cool/markup
[@media-cacher]: https://github.puregram.cool/media-cacher

### non-official ones

- [`nestjs-puregram`][nestjs-puregram]: `puregram` sdk for [nestjs](https://nestjs.com/)

[nestjs-puregram]: https://github.com/ItzNeviKat/nestjs-puregram

---

## thanks to

- [negezor][negezor] ([negezor/vk-io][negezor/vk-io]) — for inspiration, package idea (!) and some code and implementation ideas

[negezor]: https://github.com/negezor
[negezor/vk-io]: https://github.com/negezor/vk-io

<div align='center'>
  <a title='j++' href='https://github.com/jppteam'>
    <picture>
      <source media='(prefers-color-scheme: dark)' srcset='https://i.imgur.com/B301hMm.png' alt='jpp logo' width='200px'/>
      <img src='https://i.imgur.com/Npj32k1.png' alt='jpp logo' width='200px'/>
    </picture>
  </a>
</div>
