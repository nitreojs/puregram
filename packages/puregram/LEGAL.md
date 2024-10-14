<!-- inspired by prisma.io & telegraf docs -->

<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<p align='center'>
  Whereas the software package known as "puregram" (hereinafter referred to as "the Package") is deemed to be of significant utility and efficacy,
  it is hereby declared that said Package shall facilitate
  <b>expeditious interaction</b>
  with the application programming interface of the Telegram messaging service (hereinafter referred to as "the API")
  via the Node.js runtime environment,
  as set forth in the terms and conditions contained herein.
</p>

<div align='center'>
  <a href='https://github.com/nitreojs/puregram/tree/lord/docs/examples'><b>exemplars</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#typescript-usage'><b>typescript utilization</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://forum.puregram.cool'><b>telegram forum</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#faq'><b>frequently asked queries</b></a>
</div>

## Preamble

**Firstly, a definition of Telegram bots is warranted.** The messaging service known as [Telegram][telegram] provides [specialized accounts][telegram/bots] (hereinafter referred to as "bots"). Said bots shall be defined as automated Telegram accounts accessible solely via programmatic means, designed for the purpose of processing messages, inline queries, and callback queries in an automated fashion. _Human users may engage with bots by transmitting messages, commands, and inline requests thereto._

[telegram]: https://t.me
[telegram/bots]: https://core.telegram.org/bots

### Illustrative Example

```js
const { Telegram } = require('puregram')

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', context => context.reply('Greetings!'))

telegram.updates.startPolling()
```

> **Note**
> Additional exemplars may be found [herein][examples]

[examples]: https://github.com/nitreojs/puregram/tree/lord/docs/examples

---

## Table of Contents

- [Rationale for utilizing `puregram`](#why-puregram) _(of paramount importance!)_
- [**Commencement of Usage**](#getting-started)
  - [Procurement of Authentication Token](#getting-token)
  - [Installation Procedure](#installation)
  - [Usage Instructions](#usage)
  - [Elucidation of `UpdatesFilter`](#what-is-updatesfilter)
  - [Invocation of API Methods](#calling-api-methods)
    - [Suppression of API Errors](#suppressing-errors)
  - Media Operations
    - [Transmission of Media (`MediaSource`)](#sending-media)
    - [Retrieval of Media (`MediaSourceTo`)](#downloading-media)
    - [Transmission of Input Media (`InputMedia`)](#sending-input-media)
  - [Utilization of Markdown Formatting (`parse_mode`)](#using-markdown)
  - [Implementation of Keyboards (`reply_markup`)](#keyboards)
- [Bot Information](#bot-information)
- [Elucidation of Contexts](#what-are-contexts)
- [Action Controller](#action-controller)
- [`Context` and its Variants](#context-and-its-varieties)
- [Middleware Functionality](#middlewares)
- [Hook Mechanisms](#hooks)
- [**TypeScript Utilization**](#typescript-usage)
- [**Frequently Asked Queries**](#faq)
- [Ecosystem](#ecosystem)

---

## Rationale for Utilizing `puregram`

- Authored by the esteemed [starków](https://github.com/nitreojs) ⚠
- Powered by the distinguished [j++team](https://github.com/jppteam) ⚠
- Possesses a highly esteemed package designation
- The package itself is deemed to be of exceptional quality _(in the opinion of the author)_
- Demonstrates operational functionality _(to the best of the author's knowledge)_
- The author professes comprehension of approximately **30%** of the codebase
- In the absence of compelling reasons to the contrary, adoption is recommended

---

## Commencement of Usage

### Procurement of Authentication Token

Prior to the development of a bot, it is incumbent upon the developer to [create said bot][telegram/bots/botfather] via the [@botfather][botfather] service and obtain an authentication token therefrom via the `/newbot` command.

[telegram/bots/botfather]: https://core.telegram.org/bots#6-botfather
[botfather]: https://t.me/botfather

The aforementioned token shall conform to the following format: `123456:abc-def1234ghikl-zyx57w2v1u123ew11`

### Installation Procedure

#### Prerequisites

> The Node.js runtime environment must be of a version equal to or greater than the current Long-Term Support release (`16.15.0` at the time of this writing)

```sh
$ yarn add puregram
$ npm i -S puregram
```

### Usage Instructions

#### Initialization of `Telegram` Instance

To commence utilization, one must first instantiate a `Telegram` object:

```js
const { Telegram } = require('puregram')

const bot = new Telegram({
  token: '123456:abc-def1234ghikl-zyx57w2v1u123ew11'
})
```

Alternatively, initialization may be achieved via the `Telegram.fromToken` method:

```js
const bot = Telegram.fromToken('123456:abc-def1234ghikl-zyx57w2v1u123ew11')
```

Subsequently, it becomes necessary to [obtain updates][getting-updates] from the bot. **The following methodologies are available for this purpose:**

#### Retrieval of Updates

At present, there exist **two mechanisms** for obtaining updates:

1. Polling via the [`getUpdates` method][getUpdates]... or alternatively, utilizing `puregram`'s built-in polling functionality:

```js
telegram.updates.startPolling()
```

2. Establishment of a Webhook via the [`setWebhook` method][setWebhook]:

```js
const { createServer } = require('http')

// This request need only be transmitted once
telegram.api.setWebhook({
  url: 'https://www.example.com/'
})

const server = createServer(telegram.updates.getWebhookMiddleware())

server.listen(8443, () => console.log('Server initiated'))
```

It should be noted that at present, only four ports are deemed acceptable: `443`, `80`, `88` and `8443`. These are enumerated [herein][setWebhook] under the **notes** section.

> **Note**
> Additional webhook exemplars are available [at this location][webhook-examples]

[getting-updates]: https://core.telegram.org/bots/api#getting-updates
[getUpdates]: https://core.telegram.org/bots/api#getupdates
[setWebhook]: https://core.telegram.org/bots/api#setwebhook
[webhook-examples]: https://github.com/nitreojs/puregram/tree/lord/docs/examples/webhook

#### Processing of Updates

Given the aforementioned configuration, updates may be processed as follows:

```js
telegram.updates.on('message', context => context.reply('Salutations!'))
```

A comprehensive list of supported events is available [at this location](https://github.com/nitreojs/puregram/tree/lord/docs/supported-events.md)

#### The `mergeMediaEvents` Option

In circumstances where it becomes necessary to process multiple attachments simultaneously, it should be noted that in the Telegram protocol, each attachment is transmitted as a separate message. This presents certain challenges in the handling of multiple attachments concurrently. To address this issue, the `mergeMediaEvents` option has been introduced in the `Telegram` constructor.

```js
const telegram = new Telegram({
  token: process.env.TOKEN,
  mergeMediaEvents: true
})
```

**What are the implications of this modification?** If one were to establish an event handler as follows:

```js
telegram.updates.on('message', (context) => {
  console.log(context)
})
```

And subsequently transmit an album, it would become apparent that a `mediaGroup` field is present in the `MessageContext`. This `mediaGroup` (an instance of the `MediaGroup` class) provides several accessor methods:

| Accessor      | Type               | Description                                                           |
| ------------- | ------------------ | --------------------------------------------------------------------- |
| `id`          | `string`           | Unique identifier of the media group                                  |
| `contexts`    | `MessageContext[]` | Array of received (and processed) contexts containing attachments     |
| `attachments` | `Attachment[]`     | Array of attachments mapped through the aforementioned contexts       |

```js
telegram.updates.on('message', (context) => {
  if (context.isMediaGroup()) {
    // NOTE: All "is*" accessors are methods in puregram@^2.9.0
    // NOTE: If utilizing puregram < 2.9.0, "isMediaGroup" should be treated as a property rather than a method
    return context.reply(`This album contains ${context.mediaGroup.attachments.length} attachments.`)
  }
})
```

#### Manual Update Processing

Should one desire to process updates manually, the `Updates.handleUpdate` method may be employed. This method accepts a single argument, which shall be the raw Telegram update:

```js
/** Let us assume we are manually polling for updates... */

const update = await getUpdate(...)

let context

try {
  context = telegram.updates.handleUpdate(update)
} catch (error) {
  console.log('The update is not supported', update)
}

// The appropriate context is now available
// (Or it is not, if the event is unsupported 😢)
```

### Elucidation of `UpdatesFilter`

As set forth in the [`getUpdates`](https://core.telegram.org/bots/api#getupdates) documentation,

> Specify an empty list to receive all update types **except `chat_member`** (default).
> If not specified, the previous setting will be used.

It is evident that one **must** explicitly specify `chat_member` in order to receive `chat_member` updates...
However, this necessitates the specification of **every single update type** that one intends to process, as follows:

```js
{
  allowedUpdates: ['chat_member', 'message', 'callback_query', 'channel_post', 'edited_message', 'edited_channel_post', ...]
}
```

**This approach is not particularly convenient.** In light of this, we have developed `UpdatesFilter`: a class comprising several static methods
that facilitate the **specification of all update types** or even the **exclusion** of certain types!

```js
const { Telegram, UpdatesFilter } = require('puregram')

const telegram = Telegram.fromToken(process.env.TOKEN, {
  allowedUpdates: UpdatesFilter.all()
})

// puregram will now process every single update, including `chat_member` and others (if they are enumerated in the `UpdateType` enum)
```

```js
const { Telegram, UpdatesFilter } = require('puregram')

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.startPolling({
  allowedUpdates: UpdatesFilter.except('callback_query')
})

telegram.updates.on('callback_query', (context) => {
  // This event handler will never be invoked.

  return cry()
})
```

### Invocation of API Methods

There exist **three methodologies** for invoking Telegram Bot API methods:

1. Utilization of `telegram.api.call(method, params?)` _(This approach is particularly useful when a new Bot API update has been released and the package has not yet been updated)_:

```js
const me = await telegram.api.call('getMe')
```

2. Utilization of `telegram.api.method(params?)`:

```js
const me = await telegram.api.getMe()
```

3. Utilization of context methods:

```js
telegram.updates.on('message', context => context.send('The square of 13 is 169! To clarify, I mean "169", not "169!"... My apologies for any confusion.'))
```

#### Suppression of Errors

In certain circumstances, it may be deemed unnecessary to address errors returned by the API,
or it may be undesirable to create an empty `try/catch` statement for such purposes.
To address this, the `suppress` parameter has been introduced in the API call parameters.
One may pass `suppress: true` to **any** API method, and in the event of an error,
`puregram` will not throw an exception, but will instead return a JSON object with `ok: false` and `error_code` and `description` properties.

##### Usage with `telegram.api`

```js
const result = await telegram.api.sendChatAction({
  chat_id: getRandomInt(1, 999_999_999),
  action: 'typing',
  suppress: true // <- Note the inclusion of this parameter
})

// If the method was executed successfully, `result` will be `true`
// Otherwise, a `{ ok: false, error_code: ..., description: ... }` object will be returned
// For convenience, a static method is provided for this purpose:
if (Telegram.isErrorResponse(result)) {
  // result is of type ApiResponseError
  // TODO: Implement error handling
}

// result is true
```

##### Usage with `context` methods

```js
const result = await context.sendChatAction('typing', { suppress: true })

if (Telegram.isErrorResponse(result)) {
  return
}
```

### Transmission of Media

`puregram` facilitates the transmission of local media through the use of the `MediaSource` class.
This class accepts URLs, `Buffer`s, streams, and file paths.

```js
/** Let us assume the existence of an image file named puppy.jpg in the current directory... */

const { createReadStream } = require('fs')

const path = './puppy.jpg'
const stream = createReadStream(path)
const buffer = getBuffer(path)
const url = 'https://puppies.com/random-puppy'
const fileId = 'this-is-presumably-a-valid-file-id'

telegram.updates.on('message', (context) => {
  await Promise.all([
    context.sendPhoto(MediaSource.path(path), { caption: 'Canine transmitted via file path!' }),
    context.sendDocument(MediaSource.stream(stream, { filename: 'puppy.jpg' }), { caption: 'Additional canines transmitted via stream!' }),
    context.sendPhoto(MediaSource.buffer(buffer), { caption: 'Yet another canine transmitted via buffer!' }),
    context.sendPhoto(MediaSource.url(url), { caption: 'A random canine transmitted using a URL!!!' }),
    context.sendVideo(MediaSource.fileId(fileId), { caption: 'A video transmitted via file ID' })
  ])
})
```

This functionality is applicable to all methods capable of transmitting media.

### Retrieval of Media

The Telegram Bot API permits the retrieval of any desired media through a simple invocation of `getFile({ file_id })`,
extraction of the `file_path` therefrom, and construction of a specific URL which may then be fetched to obtain
the desired media.

This process may be deemed **excessively laborious** for the retrieval of a single file. In light of this, `puregram` provides a mixin that simplifies this procedure.

```js
telegram.updates.on('message', async (context) => {
  if (!context.hasAttachmentType('photo')) {
    return
  }

  const buffer = await context.download()

  // For the purpose of demonstration...
  return context.sendDocument(MediaSource.buffer(buffer, { filename: 'photo.png' }))
})
```

Naturally, one may retrieve an attachment not only via `Buffer`s, but also via `path` and `stream`. For this purpose, we utilize `MediaSourceTo` (as opposed to `MediaSource`).

##### `MediaSourceTo.path`, via file path

```js
telegram.updates.on('message', async (context) => {
  if (!context.hasAttachmentType('photo')) {
    return
  }

  const PATH = resolve(__dirname, 'photo.png')

  // Save the photo to {__dirname}/photo.png
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

  // Process the photo via stream
  const stream = new PassThrough() // Bidirectional stream

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

#### Additional Internal API

The `context.download(...)` method internally utilizes the `telegram.downloadFile(...)` method. This method may be invoked with either a `file_id` or an attachment.

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

### Transmission of Input Media

Certain methods (such as `editMessageMedia` or `sendMediaGroup`) require objects
of the type `TelegramInputMediaPhoto`, `TelegramInputMediaVideo`, and so forth.

`puregram` provides the `InputMedia` class, which facilitates the straightforward mapping of `MediaSource` values to input media objects!

```js
const { InputMedia, MediaSource } = require('puregram')

telegram.api.editMessageMedia({
  chat_id: 398859857,
  message_id: 12345,
  media: InputMedia.document(MediaSource.path('./README.md'), {
    caption: 'Extraordinary content'
  })
})

context.sendMediaGroup([
  InputMedia.photo(MediaSource.path('./image.png')),
  InputMedia.video(MediaSource.url('https://example.com/path/to/video.mp4'), {
    caption: 'Caption text here'
  })
])
```

The `InputMedia` class may even be utilized with `context.sendMedia`!

```js
context.sendMedia(
  InputMedia.photo(MediaSource.path('./image.png'), {
    caption: 'EXTRAORDINARY!!❕❕❕❕❕❗️❗️'
  })
)
```

---

### Utilization of Markdown Formatting

For the purpose of employing _markdown_ or _html_ formatting, **two methodologies** are available:

1. Utilization of the built-in `HTML`, `Markdown`, and `MarkdownV2` classes:

```js
const message = HTML.bold('Exceptionally bold, such HTML')
```

3. Manual composition of tags as specified [herein][formatting-options]:

```js
const message = '*Exceptionally bold, such markdown*'
```

[formatting-options]: https://core.telegram.org/bots/api#formatting-options

Subsequent to the composition of the text, it becomes necessary to specify the `parse_mode` field. ~~There exist **two methodologies**~~ In fact, there are three methodologies for accomplishing this!

3. Specification of the actual parse mode code _in the manner of a distinguished individual_:

```js
{ parse_mode: 'markdown' }
```

7. Passing of the parse mode class _in the manner of a less distinguished individual_:

```js
{ parse_mode: HTML }
```

- Passing of a value from the `ParseMode` enumeration _in the manner of a highly esteemed individual_:

```js
{ parse_mode: ParseMode.Markdown }
```

> **Note**
> It should be noted that `ParseMode` may be imported from `puregram` natively:
> ```js
> const { ParseMode } = require('puregram')
> ```

The final API request shall resemble the following:

```js
const message = `some ${HTML.bold('bold')} and ${HTML.italic('italic')} here`

context.send(message, { parse_mode: HTML })
```

```js
context.send(`Contemplate the utilization of _classes_ for parse mode, *how preposterous*!`, { parse_mode: 'markdown' })
```

<details>
  <summary><i>The veritable truth...</i></summary>
  <br />
  <img src="https://i.imgur.com/x6EFfCH.png" />
  <br />
  <s>This meme has been rendered obsolete by the introduction of the <code>ParseMode</code> enumeration</s>
</details>

Given that markdown-v2 necessitates the escaping of numerous characters, I have conceived of an elegant solution...

```js
const message = MarkdownV2.build`
  Verily, this constitutes an exceptional application of ${MarkdownV2.bold('template strings')}!
  ${MarkdownV2.italic('foo')} bar ${MarkdownV2.underline('baz')}
  When shall the third iteration of starkow be released?
`
```

> **Note**
> Additional markdown exemplars are available [at this location][markdown]

[markdown]: https://github.com/nitreojs/puregram/tree/lord/docs/examples/markdown

---

### Implementation of Keyboards

`puregram` provides built-in classes for the creation of basic, inline, force-reply, and other keyboard types. These classes are designed to be straightforward in their usage and offer greater convenience than the manual construction of JSON objects.

#### `InlineKeyboard`, `Keyboard`, et cetera

To create a keyboard, one must invoke the `keyboard` method from the chosen keyboard class. This method accepts an array of button rows.

```js
const { InlineKeyboard, Keyboard } = require('puregram')

const keyboard = InlineKeyboard.keyboard([
  [ // First row
    InlineKeyboard.textButton({ // First row, first button
      text: 'Button text here',
      payload: 'Associated payload'
    }),

    InlineKeyboard.textButton({ // First row, second button
      text: 'Additional button text here',
      payload: { json: true }
    })
  ],

  [ // Second row
    InlineKeyboard.urlButton({ // Second row, first button
      text: 'URL button',
      url: 'https://example.com'
    })
  ]
])
```

```js
// Single-row keyboard with two buttons, no brackets for rows required
const keyboard = Keyboard.keyboard([
  Keyboard.textButton('Single-row keyboard text'),
  Keyboard.textButton('With additional buttons')
]).resize()
```

> **Note**
> As of `puregram@2.14.0`, one may utilize simple strings in lieu of `Keyboard.textButton`s!
>
> ```js
> // Two-row keyboard with one button on each row, utilizing strings!
> const keyboard = Keyboard.keyboard([
>   [
>     'First row, single button'
>   ],
>   [
>     'Second row, still a single button!'
>   ]
> ]).resize()
> ```

#### Keyboard Builders

Additionally, keyboard **builders** are provided, designed for the incremental construction of keyboards:

```js
const { KeyboardBuilder } = require('puregram')

const keyboard = new KeyboardBuilder()
  .textButton('First row, first button')
  .row()
  .textButton('Second row, first button')
  .textButton('Second row, second button')
  .resize() // The keyboard will be rendered in a more compact form
```

#### Transmission of Keyboards

To transmit a keyboard, one need only pass the generated value in the `reply_markup` field:

```js
context.send('Behold, a keyboard!', { reply_markup: keyboard })
```

> **Note**
> Additional keyboard exemplars are available [at this location][keyboards]

[keyboards]: https://github.com/nitreojs/puregram/tree/lord/docs/examples/keyboards

---

## Bot Information

When utilizing `puregram`'s built-in polling logic, subsequent to the invocation of `Updates.startPolling()`, one gains access to the `Telegram.bot` property:

```js
telegram.updates.startPolling().then(
  () => console.log(`@${telegram.bot.username} has commenced polling`)
)
```

---

## Elucidation of Contexts

`Context` is a class that encapsulates the current `update` object and its payload _(via `update[updateType]`)_. It is endowed with a multitude of useful _(perhaps?)_ accessors and methods designed to reduce code verbosity while maintaining equivalent efficiency and executing identical code.

```js
telegram.updates.on('message', (context) => {
  const id = context.senderId
  // This is equivalent to
  const id = context.from?.id
})
```

```js
telegram.updates.on('message', (context) => {
  context.send('Greetings!')
  // This is equivalent to
  telegram.api.sendMessage({
    chat_id: context.chat?.id,
    text: 'Greetings!'
  })
})
```

Every context possesses a `telegram` property, enabling the invocation of API methods from virtually any location where a context is accessible.

```js
telegram.updates.on('message', async (context) => {
  const me = await context.telegram.api.getMe()
})
```

---

## Action Controller

The `sendChatAction` method necessitates invocation every **5** seconds
until the action is completed. However, how does one implement this functionality?

Even the most rudimentary solutions require certain _unconventional_ approaches. It is for this reason that
`puregram` encapsulates these _unconventional methods_, allowing for their immediate utilization,
even with a **controller**!

```js
telegram.updates.on('message', (context) => {
  // This construct will invoke `context.sendChatAction('typing')`
  // every 5 seconds until `controller.abort()` is called
  const controller = context.createActionController('typing')

  controller.start()

  await sleep(14_000) // For the purpose of demonstration

  controller.stop() // It is imperative to invoke this method!!!

  return context.send('We regret to inform you that we are presently unable to process your message.')
})
```

Naturally, one may modify `controller.action` and all the options enumerated below while the controller is in operation.

#### `createActionController` options

| Key        | Type     | Required? | Default | Description                                                                    |
| ---------- | -------- | --------- | ------- | ------------------------------------------------------------------------------ |
| `interval` | `number` | No        | `5000`  | Interval between `sendChatAction` invocations, expressed in milliseconds       |
| `wait`     | `number` | No        | `0`     | Initial delay before the first cycle of `sendChatAction` calls, in milliseconds |
| `timeout`  | `number` | No        | `30000` | Timeout for `sendChatAction` invocations, expressed in milliseconds             |

---

## `Context` and its Variants

Each update in `puregram` is processed by a specialized context, which is determined based on the update key.

Every context _(with the exception of manually created contexts and certain contexts generated after methods such as `sendMessage`)_ will possess `updateId` and `update` properties.

| Property   | Required | Description                                                                   |
| ---------- | -------- | ----------------------------------------------------------------------------- |
| `updateId` | No       | Unique update identifier. Utilized as an offset when retrieving new updates   |
| `update`   | No       | Update object. The current context was generated via `this.update[this.updateType]` |

For instance, given a `message` update, we shall receive a `MessageContext` for this update, a `CallbackQueryContext` for a `callback_query` update, and so forth.

Each context requires **one argument**:

```ts
interface ContextOptions {
  // Primary Telegram instance
  telegram: Telegram

  // Update type, e.g. 'message', 'callback_query'
  updateType: UpdateName

  // Complete update object
  // Optional, allows the user to access the entire update object via `context.update`
  update?: TelegramUpdate

  // Update identifier, located within TelegramUpdate
  // Optional, allows the user to retrieve this update's identifier
  updateId?: number
}
```

> **Note**
> Certain contexts may be combined into a single structure due to the architecture of the Telegram Bot API. **What are the implications of this?**
>
> The simplest examples are [extra contexts](extra-events):
> Their payload is contained within the `Message` structure itself, thus they are inherently `Message`s, meaning they are also `MessageContext`s.
>
> ```js
> telegram.updates.on('forum_topic_created', (context) => {
>   // Technically, context is of type `ForumTopicCreatedContext`, but internally it was largely constructed
>   // as a MessageContext due to the `forum_topic_created` property residing within `Message`
> })
> ```

One may also create any context manually:

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

> **Note**
> A comprehensive list of contexts is available [at this location][contexts]

[contexts]: https://github.com/nitreojs/puregram/tree/lord/packages/puregram/src/contexts
[extra-events]: https://github.com/nitreojs/puregram/blob/lord/docs/supported-events.md#extra-events

---

## Middleware Functionality

`puregram` implements middleware logic, enabling the expansion of `context` variables or the measurement of other middlewares.
The `next()` function is utilized to invoke the subsequent middleware in the chain and await its completion.

- Measurement of update processing duration:

```js
telegram.updates.use(async (context, next) => {
  const start = Date.now()

  await next() // next() is asynchronous, thus necessitating the use of await

  const end = Date.now()

  console.log(`${context.updateId ?? '[unknown]'} processed in ${end - start}ms`)
})
```

- Extension of the context:

```js
telegram.updates.use(async (context, next) => {
  context.user = await getUser(context.senderId)

  return next()
})

telegram.updates.on('message', (context) => {
  // Here we may access the property created in the middleware
  return context.send(`Greetings, ${context.user.name}!`)
})
```

---

## Hook Mechanisms

As of `v2.19.0`, `puregram` incorporates **hooks** - a mechanism for intercepting outgoing *(and incoming in the future)* requests
and manipulating the data therein. This facilitates the creation of interceptors that, for example,
always append `parse_mode: 'html'` to `sendMessage` calls, or even abort (cancel) requests!

```js
telegram.onBeforeRequest((context) => {
  if (context.path === 'sendMessage') {
    context.params.parse_mode = 'html'
  }

  return context
})

telegram.updates.on('message', (context) => {
  return context.reply('This <b>will be</b> <i>parsed</i> correctly!')
})
```

### Further Exploration of Hooks

There are currently **five** hooks available for use. Each possesses its own set
of variables referred to as *context*. **It is imperative to return the same structure of object that was provided when the hook was triggered**

Each *context* incorporates the keys present in the previous interceptor. For example,
consider this `BaseContext` from which every other context extends:

| Key          | Type                 | Description                                              |
| ------------ | -------------------- | -------------------------------------------------------- |
| `controller` | `AbortController`    | Standard `AbortController`, facilitating request abortion via `abort()` |
| `init`       | `undici.RequestInit` | `fetch()` parameter object                                |

Each context enumerated below shall possess the aforementioned `controller` and `init` keys IN ADDITION TO their respective keys

The hooks are enumerated below in order of their execution, from top to bottom:

1. `onBeforeRequest`: This hook is processed when the API request has just been intercepted and is commencing its setup process

| Key      | Type                  | Description                                |
| -------- | --------------------- | ------------------------------------------ |
| `path`   | `string`              | API method path, e.g., `sendMessage`       |
| `params` | `Record<string, any>` | API method parameters                      |

2. `onRequestIntercept`: Hook that is executed immediately prior to the processing of the API call

| Key     | Type     | Description                              |
| ------- | -------- | ---------------------------------------- |
| `query` | `string` | URL query constructed from the `params`  |
| `url`   | `string` | Complete API request URL                 |

3. API call. No hook is available for this stage, regrettably.

4. `onResponseIntercept`: API call has (presumably) succeeded, `response` and `json` are available for examination

| Key        | Type               | Description                            |
| ---------- | ------------------ | -------------------------------------- |
| `response` | `undici.Response`  | HTTP response received from API        |
| `json`     | `ApiResponseUnion` | HTTP response transformed into JSON 👻 |

5. `onAfterRequest`: All required operations have been completed, constituting the final stage

*No additional keys are provided for `onAfterRequest`*

Additionally, there is `onError`, which encompasses the area between `onRequestIntercept` and `onAfterRequest` hooks

| Key     | Type    | Description                   |
| ------- | ------- | ----------------------------- |
| `error` | `Error` | The error that has transpired |

### Exporting Hooks into Packages

*Or, more plainly, "How does one export multiple hooks and utilize them with ease?"*

`puregram` provides the `telegram.useHooks(hooks)` method, which facilitates the straightforward passing of multiple hooks of various types
instantaneously. This greatly simplifies the process of importing several hooks simultaneously, for instance, when importing them
from an external package:

```js
// Let us assume `hooks` is a function that returns a `puregram.Hooks` object (to be discussed subsequently)
import { hooks as imagination } from 'imaginary-package'

telegram.useHooks(imagination())

// ... That is the entirety of the process!
```

Beneath the *imaginary* surface, `hooks` (alias `imagination` in this instance) is a function (though it need not necessarily be a function)
that returns a `puregram.Hooks` interface - an object that may be imported from `puregram/hooks`:

```ts
import { Hooks } from 'puregram/hooks'

export function hooks(): Hooks {
  return () => ({
    onBeforeRequest: [(context) => { ... }],
    onAfterRequest: [(context) => { ... }]
  })
}
```

*That concludes the explanation!*

---

## TypeScript Utilization

### Extension of Contexts

It is indeed possible to extend contexts with additional fields and properties as required by intersecting the base context with new properties.

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
 * There exist two methodologies for updating the context's type:
 * 1. External type override:
 * `(context: MessageContext & ExtraData) => ...`
 * 2. Utilization of generics:
 * `telegram.updates.on<ExtraData>(...)`
 *
 * The latter methodology shall be employed herein.
 */

telegram.updates.on<ExtraData>('message', (context) => {
  assert(context.name !== undefined)
})
```

---

### Importation of Telegram Interfaces

All Telegram interfaces and method types are automatically generated and placed in distinct files: `telegram-interfaces.ts` for interfaces and `methods.ts` + `api-methods.ts` for API methods. These are accessible at the paths `puregram/telegram-interfaces`, `puregram/methods`, and `puregram/api-methods` respectively.
Additionally, there exists a `puregram/generated` export which exports all contents from the `lib/generated` folder (encompassing all of the aforementioned).

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

### Type Predicates

`puregram` implements [type predicates](typescript-type-predicates) (also known as *type guards*)
on certain context methods (primarily those with names commencing with `is`/`has`/`can`) in order to
maintain consistency between types and actual values

```ts
telegram.updates.on('message', (context) => {
  const originalText = context.text
  // Upon examination of `originalText`'s type, we observe `string | undefined`

  // Fortunately, there exists a type predicate `hasText()` which informs TypeScript that `context.text` is definitively a `string`!
  if (context.hasText()) {
    const text = context.text
    // `text`'s type is now `string`. `undefined` has been eliminated! Huzzah!!
  }
})
```

Furthermore, `Context.is` also functions as a type guard! This enables the following:

```ts
if (context.is('callback_query')) {
  // context is now of type CallbackQueryContext
}
```

This proves particularly useful when dealing with `context: Context` and is especially convenient as it eliminates the need to import
the correct contexts merely to perform this mundane task:

```ts
if (context instanceof CallbackQueryContext) {
  // This approach is suboptimal! context.is('callback_query') is superior   👍😎👍
}
```

> **Note**
> Due to the implementation of type guards, it was deemed necessary to transition all accessors commencing with `is`/`has`/`can` into methods across all structures.
> This implies that if one encounters a field beginning with the aforementioned prefixes, **one can be certain** that it is definitively a method
> and not a getter or property!

[typescript-type-predicates]: https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates

## Frequently Asked Queries

### `TypeError: Cannot read property '__scene' of undefined`

You are attempting to utilize [`@puregram/scenes`][@scenes] or [`@puregram/hear`][@hear] in conjunction with [`@puregram/session`][@session], but you have erroneously ordered the middlewares

It is imperative that you first initialize `@puregram/session`'s middleware and only subsequently initialize other middlewares that depend upon it:

```js
const hearManager = new HearManager()

// 1. Session middleware must be initialized first
telegram.updates.use(session())

// 2. Hear middleware should be initialized second
telegram.updates.on('message', hearManager.middleware)
```

### How does one enable debugging?

Should you wish to inspect outgoing and incoming requests made by `puregram`, it becomes necessary to enable the `DEBUG` environment variable, thereby signaling to the package that you are prepared for logging.

#### Methodology for enabling `DEBUG`

| Namespace   | Example (Unix)             | Description                                                                       |
| ----------- | -------------------------- | --------------------------------------------------------------------------------- |
| `api/getMe` | `DEBUG=puregram:api/getMe` | Enables debugging of the `getMe` update (one may specify any method for debugging) |
| `updates`   | `DEBUG=puregram:updates`   | Enables debugging of incoming updates                                             |
| `all`       | `DEBUG=puregram:*`         | Enables debugging of all aforementioned types                                     |

##### CMD

```cmd
> set "DEBUG=puregram:all" & node index
```

##### PowerShell

```ps
> $env:DEBUG = "puregram:all"; node index
```

##### Linux

```sh
$ DEBUG=puregram:all node index
```

### Are there any Telegram chats or channels available?

Indeed! `puregram` has recently established its own forum! It encompasses all necessary topics and
shall expand as required!

Should you find yourself uncertain and in need of assistance, **[@pureforum][pureforum] is unequivocally the optimal recourse!**

[pureforum]: https://forum.puregram.cool

### Why is your README composed in lowercase?

As I harbor a disinclination towards anything that appears excessively formal, I have elected to employ my own stylistic preferences 😎

**Additionally, have you perused these issues?**
- https://github.com/nitreojs/puregram/issues/63
- https://github.com/nitreojs/puregram/issues/62

They serve to corroborate my aversion to anything that presents itself as overly official 😉

---

## Ecosystem

These packages have been created by the `puregram` community _(and others)_ and serve to augment the functionality of the package _(presumably)_.

### Select Official Packages

- [`@puregram/hear`][@hear]: Straightforward implementation of a hear system
- [`@puregram/scenes`][@scenes]: Straightforward implementation of middleware-based scene management
- [`@puregram/session`][@session]: Straightforward implementation of sessions
- [`@puregram/utils`][@utils]: Useful utilities
- [`@puregram/prompt`][@prompt]: Basic prompt system implementation
- [`@puregram/callback-data`][@callback-data]: Basic callback data validation and serialization
- [`@puregram/markup`][@markup]: Simple yet powerful markup system
- [`@puregram/media-cacher`][@media-cacher]: Effortlessly cache transmitted media `file_id`s!

[@hear]: https://github.puregram.cool/hear
[@scenes]: https://github.puregram.cool/scenes
[@session]: https://github.puregram.cool/session
[@utils]: https://github.puregram.cool/utils
[@prompt]: https://github.puregram.cool/prompt
[@callback-data]: https://github.puregram.cool/callback-data
[@markup]: https://github.puregram.cool/markup
[@media-cacher]: https://github.puregram.cool/media-cacher

### Unofficial Packages

- [`nestjs-puregram`][nestjs-puregram]: `puregram` SDK for [nestjs](https://nestjs.com/)

[nestjs-puregram]: https://github.com/ItzNeviKat/nestjs-puregram

---

## Acknowledgements

- [negezor][negezor] ([negezor/vk-io][negezor/vk-io]) — For inspiration, package concept (!), and certain code and implementation ideas

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
