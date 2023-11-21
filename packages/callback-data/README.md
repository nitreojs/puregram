<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#typescript-usage'><b>typescript usage</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/pureforum'><b>telegram forum</b></a>
</div>

## @puregram/callback-data

_basic callback data validation and serialization for `puregram` package_

### introduction

i'm **tired** of people using json objects as their callback data payload.
this is **NOT** okay, you should **NOT** do that. at least because it's
not safe when it comes to amount of bytes _(`JSON.stringify` your ass)_,
at most because at the end you have zero types, zero validation, zero anything

`@puregram/callback-data` provides those mentioned things. yeah, you can
write callback data payload that will be validated and will have correct types!
**incredible.**

### example

let's create a keyboard that will automatically ban the user!

```js
const { Telegram, InlineKeyboard } = require('puregram')

const { CallbackDataBuilder } = require('@puregram/callback-data')

const telegram = Telegram.fromToken(process.env.TOKEN)

// we create a 'ban' callback data...
const BanPayload = CallbackDataBuilder.create('ban')
  // ... with a number field 'user_id'
  .number('user_id')

const createBanKeyboard = (userId: number) => (
  InlineKeyboard.keyboard([
    InlineKeyboard.textButton({
      text: 'Ban',
      // here we pack our callback data into a small parseable string
      // with all our needed payload
      payload: BanPayload.pack({ user_id: userId })
    })
  ])
)

// let's create our handler
telegram.updates.on('message', (context) => {
  return context.send('User sent a message!', {
    chat_id: process.env.ADMIN_ID,
    reply_markup: createBanKeyboard(context.senderId)
  })
})

// let's handle our 'ban' callback queries!
telegram.updates.use(
  BanPayload.handle((context) => {
    // for convenience
    const payload = context.unpackedPayload
    //    payload: { user_id: number }

    // you can now do whatever you want with `payload.user_id`!
  })
)

telegram.updates.startPolling()
```

### installation

```sh
$ yarn add @puregram/callback-data
$ npm i -S @puregram/callback-data
```

### `optional` or `default`ed values

it's possible that you will need a value that may not be present at all times (basically
an `optional` value, right?)

`@puregram/callback-data` has tools for handling `optional` values and values that have
a `default` value

##### `optional`

```js
const BanPayload = CallbackDataBuilder.create('...')
  .number('user_id')
  .string('reason', { optional: true })

telegram.updates.use(
  BanPayload.handle((context) => {
    const payload = context.unpackedPayload
    //    payload: { user_id: number, reason?: string | undefined }
  })
)
```

you can also use [filtering][filtering] and [literally filters][literally-filters] to handle
specific cases like when you have the reason for ban and when you dont

```js
telegram.updates.use(
  BanPayload.filter({ reason: filters.exists() }).handle((context) => {
    const payload = context.unpackedPayload
    //    payload: { user_id: number, reason: string }
    // reason will always be present in this case!
  })
)

telegram.updates.use(
  BanPayload.filter({ reason: filters.exists(false) }).handle((context) => {
    const payload = context.unpackedPayload
    //    payload: { user_id: number, reason: undefined }
    // reason will always be undefined here no matter what
  })
)
```

ez stuff $$$

[filtering]: #filtering

### filtering

sometimes you will need to process updates in more detail. that's why `CallbackDataBuilder` 
has its own `filter` function (that is also type-safe! _as far as i know_).
it can accept those values:
- raw values (`string`, `boolean`, `number`);
- a function that takes the value and returns non-`false` value;
- an array of those above;
- or a [filter][literally-filters].

##### raw value

```js
telegram.updates.use(
  BanPayload.filter({ user_id: 1337 }).handle((context) => {
    // will be called only if `user_id` is exactly `1337`
  })
)
```

##### function

```js
const ADMIN_IDS = [1, 2, 3]

telegram.updates.use(
  BanPayload.filter({ user_id: (userId) => !ADMIN_IDS.includes(userId) }).handle((context) => {
    // this will not be called if `user_id` is either `1`, `2` or `3`
    // will be called otherwise though
  })
)
```

##### an array

```js
telegram.updates.use(
  BanPayload.filter({ user_id: [42, (userId) => userId % 2 !== 0 ] }).handle((context) => {
    // will be called EITHER if `user_id` is `42` OR if `user_id` is even
    // because who wants people with odd user IDs be banned? ¯\_(ツ)_/¯
  })
)
```

[literally-filters]: #literally-filters

### literally `filters`

`@puregram/callback-data` also has _filters_ for **filters**. they're called... _**filters**_.

currently there aren't much of those: only `filters.exists(exists?: boolean)` and that's it.
it will probably be expanded in the future...

```js
const { filters } = require('@puregram/callback-data')

const FooPayload = CallbackDataBuilder.create('foo')
  .string('bar')
  .boolean('baz', { optional: true })
  .number('quix', { default: 42 })

telegram.updates.use(
  FooPayload.filter({ baz: filters.exists() }).handle((context) => {
    // this will be called only if `baz` iz provided (not `undefined`)
  })
)
```

not sure what to describe here, filters act like filters: they filter out values

---

## typescript usage

`@puregram/callback-data`'s updates are based on `puregram`'s `CallbackQueryContext`
so `CallbackQueryContext` will have a new `unpackedPayload: Record<never, never>`
property by default, but you definitely won't use that in your ordinary `'callback_query'`
updates, so don't worry about that. everything you need is already packed into
`handle`s logic under the hood

```ts
import { CallbackDataBuilder } from '@puregram/callback-data'

const BanPayload = CallbackDataBuilder.create('ban')
  .number('user_id')

// ...

telegram.updates.use(
  BanPayload.handle((context) => {
    const payload = context.unpackedPayload
    //    payload: { user_id: number }
  })
)
```

but in case you really need to extend your own contexts with that juicy
types you can always import `CallbackLayer`:

```ts
import type { Context } from 'puregram'
import type { CallbackLayer } from '@puregram/callback-data'

type MyContext<C extends Context> = C & CallbackLayer<typeof BanPayload>
```

that's it!
