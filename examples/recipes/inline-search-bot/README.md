# inline-search bot recipe

a realistic inline-mode bot: paginated substring search over a mock product catalog with chosen-result analytics.

type `@<bot_username> <query>` in any chat — the bot returns up to 5 matches per page; scrolling loads more via telegram's `next_offset` continuation. each picked result is logged on the bot side so you can wire popularity tracking or recommendations on top.

## prerequisites

- a bot token from @BotFather
- inline mode enabled in @BotFather (`/setinline`)

## run

```sh
cp .env.example .env
# fill in TOKEN=
yarn install
yarn dev
```

## how it works

- **catalog** (`src/catalog.ts`) is a tiny in-memory dataset with a case-insensitive substring search and slice-based pagination — swap for a real db or http search in production
- **inline handler** (`src/index.ts`) reads `update.query` and `update.offset` (telegram's continuation token), answers with a page of `InlineQueryResult.article`s, and sets `next_offset` to the next page index when more results exist
- `is_personal: true` tells telegram to cache per-user, not globally — required when results depend on the picker (saved items, geo, account state, etc.)
- when zero results match, the answer includes a `button` that deep-links into a private chat with the bot — handy for "didn't find what you wanted? open me up and ask" flows
- **chosen-result handler** logs which result the user picked; in a real bot this is where you'd bump a popularity counter, write to analytics, or trigger a follow-up

`offset` is telegram's continuation primitive — a free-form string the bot defines. here we pass page numbers as strings (`'1'`, `'2'`, ...); empty / unparseable offsets count as page 0

## see also

- [inline query basics](../../src/core/updates/inline-query-basics.ts)
- [bot api inline mode docs](https://core.telegram.org/bots/api#inline-mode)
