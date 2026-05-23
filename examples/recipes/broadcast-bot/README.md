# broadcast bot recipe

an admin-only fan-out bot that broadcasts an arbitrary message (text, photo, document, sticker, anything) to every user the bot has talked to.

every user that talks to the bot lands in a subscriber list. an admin replies `/broadcast` to any message in their own chat → the bot copies that message to each subscriber, paced by `@puregram/throttler` to stay under telegram's 30 msg/sec limit. subscribers who blocked the bot or deleted their account are silently pruned during the run.

```
admin chat                       bot                            subscribers
─────────────                  ─────────                       ───────────────
  any message                 (admin /broadcast reply)
       │                              │
       └──── /broadcast (reply) ─────►│
                                      │ subscribers.list() → [u1, u2, ..., uN]
                                      │
                                      │  ┌─ worker 1 ─┐
                                      │  │  copyMessage(u1, ...) │  ──► u1
                                      │  │  copyMessage(u5, ...) │  ──► u5
                                      │  ├─ worker 2 ─┤             ...
                                      │  │  copyMessage(u2, ...) │  ──► u2
                                      │  │  copyMessage(u6, ...) │  ──► u6
                                      │  └────────────┘
                                      │       │                      ▲
                                      │       │ throttler gates       │
                                      │       │ to 30/sec global       │
                                      │       │                      │
                                      │       │ 403 / 400 → subscribers.remove
                                      │
                                      │ progress edit every 25 sent
                                      │
       ◄──── 'sent 247/300, removed 12' (live)
       ◄──── final summary
```

## prerequisites

- a bot token from @BotFather
- your own telegram user id (send `/start` to the bot once — the bot logs all incoming user ids)

## run

```sh
cp .env.example .env
# fill in TOKEN= and ADMIN_USER_ID=
yarn install
yarn dev
```

then:

1. **subscribe a few accounts** — send `/start` (or any message) from each test account you want on the list
2. **as the admin** — send some message you want to broadcast (a sticker, photo, plain text — anything)
3. **reply to that message** with `/broadcast` — the bot copies it to every subscriber

| admin command | what it does |
|---|---|
| `/broadcast` (reply to a message) | fan out that message to every subscriber |
| `/stats` | show current subscriber count |

non-admins get `not authorized` if they try `/broadcast`. their `/start` and other messages add them to the subscriber list silently

## how it works

- **`src/subscribers.ts`** — `SubscriberStore` wraps a `KVStorage` from `@puregram/storage`. the recipe ships `MemoryStorage` (resets on restart); swap for `@puregram/storage-redis` / `@puregram/storage-sqlite` in `bot.ts` and the rest of the code stays the same
- **`src/broadcast.ts`** — worker-pool fan-out with a configurable concurrency cap. each worker pulls a subscriber id off a queue, calls `copyMessage`, and:
  - on `ApiError` with code `403` or `400` → assumes the user blocked the bot or deleted their account → removes them from the store
  - on any other error → counts as a failure but keeps the subscriber on the list (transient errors shouldn't cost a subscriber)
- **`src/bot.ts`** — installs `@puregram/throttler` so the worker pool can run wide without breaching the 30 msg/sec global cap. `retryOnFloodWait` is also enabled for the rare 429 that slips through

### why `copyMessage` instead of `forwardMessage`

`copyMessage` produces a fresh message that doesn't carry "Forwarded from …" attribution — the subscriber sees the content as if the bot sent it directly. `forwardMessage` would expose the admin's identity. for almost every broadcast use case `copyMessage` is what you want

### why a worker pool, not `Promise.allSettled`

firing all `N` `copyMessage` calls at once means the throttler queues them all, which works, but progress reporting becomes awkward (you'd have to attach progress listeners to each promise). a worker pool with concurrency ~25 gives the throttler ~25 pending acquires at any moment — enough to saturate the 30/sec budget — while letting the workers report progress as they advance through the queue

### storage swap

swap `MemoryStorage` for redis (workspace dep already installed):

```ts
import { RedisStorage } from '@puregram/storage-redis'

const subscribers = new SubscriberStore(new RedisStorage({ url: process.env.REDIS_URL! }))
```

the subscriber list persists across restarts, and the cleanup writes during a broadcast also persist — a crash mid-broadcast won't lose the pruned users

## see also

- [@puregram/throttler](../../../packages/throttler/README.md)
- [@puregram/storage](../../../packages/storage/README.md)
- [bot api copyMessage](https://core.telegram.org/bots/api#copymessage)
- [bot api FAQ — broadcasting](https://core.telegram.org/bots/faq#broadcasting-to-users)
