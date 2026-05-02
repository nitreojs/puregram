# @puregram/rate-limit

> v3 alpha — work in progress.

per-user fixed-window rate limiting plugin for puregram v3:

- `rateLimit(options?)` plugin — `tg.extend(rateLimit())` attaches `tg.rateLimit.{check, hit, reset}` (imperative bucket access). registers no global middleware on its own — gating is opt-in per call site.
- `rateLimitFilter(tg, opts)` — composable async filter. swallows the update on block (handler does not run) and invokes `onLimitExceeded` for side-effects.
- `rateLimitMiddleware(tg, opts)` — `onUpdate` middleware variant. blocks downstream middleware and handlers when over budget. pair with `when(filter, ...)` from `puregram/filters` to scope.

backed by `KVStorage<RateLimitEntry>` from `@puregram/storage`. defaults to `MemoryStorage`; swap in any `KVStorage` implementation (redis, sql, ...) via `rateLimit({ storage })`.

## quickstart

```ts
import { Telegram } from 'puregram'
import { command, kind, when } from 'puregram/filters'
import { rateLimit, rateLimitFilter, rateLimitMiddleware } from '@puregram/rate-limit'

const tg = new Telegram({ token: process.env.BOT_TOKEN! })
  .extend(rateLimit({
    onLimitExceeded: (update, retryAfter) => {
      // optional plugin-level fallback. silent no-op if omitted
      console.log(`limit hit: retry in ${retryAfter}s`)
    }
  }))

// per-handler gate via filter composition
tg.onUpdate(
  command('pay').and(rateLimitFilter(tg, { limit: 3, window: 60, bucket: 'pay' })),
  (update) => update.send('paying...')
)

// global gate via middleware
tg.useHook(
  'onUpdate',
  when(kind.message, rateLimitMiddleware(tg, { limit: 30, window: 60 })),
  { priority: 'high' }
)

// imperative gate inside a handler
tg.onMessage(async (update) => {
  const retry = await tg.rateLimit.check(update, { limit: 5, window: 10, bucket: 'msg' })

  if (retry !== null) {
    return update.reply(`slow down — retry in ${retry}s`)
  }

  // ...
})
```

## key derivation

the default key is the same precedence used by `@puregram/session`:

1. `update.from.id` (the authoring user)
2. `update.senderChat.id` (channel posts)
3. `update.chat.id` (anonymous service updates)
4. `undefined` — the update is **passed through, never blocked**. unkeyable updates are not rate-limited

override via `rateLimit({ getKey: (update) => string | undefined })`.

per-call `bucket` composes with the resolved key: `${bucket ?? 'default'}:${userKey}`. one user can have N independent counters by using different buckets (e.g. `'pay'`, `'msg'`, `'cb'`).

## block behavior

filter and middleware shapes both **swallow** the update on block — downstream filters / handlers / middleware do not run. they invoke the `onLimitExceeded(update, retryAfter)` callback for side-effects (typically `update.reply('slow down')`). resolution order for the callback:

1. per-call `opts.onLimitExceeded` (if supplied)
2. plugin-level `rateLimit({ onLimitExceeded })`
3. silent no-op (default)

the imperative `tg.rateLimit.check(update, opts)` form does **not** invoke the callback — it returns `retryAfter` directly so the caller composes the response themselves. use this form when you want fall-through semantics or a non-default response (e.g. `update.answer({ text: ..., show_alert: true })` for callback queries).

## window semantics

fixed-window — `{ limit: 3, window: 60 }` allows 3 requests in any 60-second window. when the window expires (next request after `resetAt`), the counter resets to 1.

worst case is `2 × limit` requests at a window boundary (3 at `t=59s`, 3 more at `t=61s`). acceptable for spam prevention; if you need stricter sliding-window semantics, build it as a custom `KVStorage<RateLimitEntry>` that updates timestamps differently and pass it via `rateLimit({ storage })`.

## storage

defaults to a fresh `MemoryStorage<RateLimitEntry>` from `@puregram/storage`. for production, pass a persistent backend:

```ts
import { rateLimit } from '@puregram/rate-limit'
import { MyRedisStorage } from './my-redis-storage'

tg.extend(rateLimit({ storage: new MyRedisStorage() }))
```

any `KVStorage<RateLimitEntry>` works. the plugin does not require `TtlStorage.touch` — counter rolling handles expiry inline.
