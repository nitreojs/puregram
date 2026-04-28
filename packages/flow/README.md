# @puregram/flow

> v3 alpha — work in progress.

conversational primitives plugin for puregram v3:

- `waitFor` — pause a handler until the next matching update arrives (FIFO, timeout, consume).
- `prompt` — send a message and wait for the user's reply.
- `mediaGroup` — opt-in sub-plugin that aggregates album messages into a single `media_group` update.

documentation, examples, and migration guide will land alongside the v3 stable release.

## persistence

`flow.prompt` / `flow.waitFor` accept an optional `id` to persist the wait across bot restarts. requires `flow({ storage })` — any `KVStorage<PersistedFlow>` works (use `@puregram/storage`'s `MemoryStorage` for tests, drop in a custom adapter for production).

```ts
import { MemoryStorage } from '@puregram/storage'
import { flow } from '@puregram/flow'

const tg = Telegram.fromToken(token).extend(flow({ storage: new MemoryStorage() }))

tg.flow.handle('register:name', {
  validate: m => (m.text?.length ?? 0) > 0 || 'name cannot be empty',
  transform: m => m.text!,
  onAnswer: async (name, ctx) => {
    await ctx.open('register:age', { text: 'how old?', payload: { name } })
  }
})

tg.flow.handle('register:age', {
  validate: m => /^\d+$/.test(m.text ?? '') || 'must be a number',
  transform: m => Number(m.text),
  onAnswer: async (age, ctx) => {
    const { name } = ctx.payload as { name: string }
    await ctx.send(ctx.chatId, `welcome, ${name} (${age})`)
  }
})

tg.hear(/^\/start$/, async update => {
  await update.flow.prompt('what is your name?', { id: 'register:name' })
})
```

passing `{ id }` without `flow({ storage })` throws `FlowPersistenceUnconfigured`. one open prompt per `(chatId, fromId, kind)` triple — opening a second one for the same triple replaces the first. record kept on `FlowHandlerMissing` so a later boot with the handler can resume.

`ttl` is opt-in: pass per call or `flow({ defaultTtl })` for a global default. without either, persisted records live until matched. expired records run `onTimeout` lazily on the next inbound update for the triple.

## validate / transform

both ephemeral and persistent prompts accept `validate(update) => true | false | string` and `transform(update) => T`.

- `true` — match accepted, transform runs, `await` / `onAnswer` fires.
- `false` — silent re-prompt; the open record stays.
- `string` — bot sends the string back to the chat, then re-prompts.

`transform`'s return type drives the `await` / `onAnswer` value type.

## prompts that wait for callback_query

```ts
const cb = await update.flow.prompt('pick one', {
  kind: 'callback_query',
  reply_markup: InlineKeyboard.keyboard([
    [InlineKeyboard.textButton({ text: 'yes', payload: 'yes' })],
    [InlineKeyboard.textButton({ text: 'no',  payload: 'no'  })]
  ])
})
// cb: CallbackQueryUpdate
```

the same `kind` parameter applies on the persistent path (set on the handle config and at the call site).
