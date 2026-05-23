# premium bot recipe

a complete telegram stars payments demo: one-time purchase, 30-day subscription, and admin-initiated refunds.

users run `/unlock` and pick between a one-time premium pass and a monthly subscription, both priced in stars. the bot stores the resulting `telegram_payment_charge_id` so it can later cancel subscriptions (`editUserStarSubscription`) and process refunds (`refundStarPayment`).

## prerequisites

- a bot token from @BotFather
- your own telegram user id (for the `/refund` admin command) — easy way: run the bot, send `/start`, the bot replies with your id
- nothing else — stars payments need no provider token and no BotFather setup

## run

```sh
cp .env.example .env
# fill in TOKEN= and ADMIN_USER_ID=
yarn install
yarn dev
```

then in the bot's private chat:

| command       | what it does |
|---------------|--------------|
| `/start`      | greeting + shows your user id |
| `/unlock`     | shows two invoice buttons — one-time and subscription |
| `/content`    | premium-gated content; free users get a teaser |
| `/status`     | shows your current entitlement (none / one-time / active sub / expired) |
| `/cancel`     | cancels an active subscription (renewal stops at period end) |
| `/refund`     | (admin only) lists recent charges and lets you refund any of them |

## how it works

### the four payment events

```
user taps "pay" on invoice
        │
        ▼
  onPreCheckoutQuery     ← bot must answer ok within 10s or telegram cancels
        │
        ▼
  payment processed by telegram
        │
        ▼
  onSuccessfulPayment    ← `kind: 'successful_payment'` message arrives
        │
        ▼
  (recurring only) every 30 days → onSuccessfulPayment with isRecurring=true
```

**preCheckoutQuery** is your last chance to refuse — check inventory, validate the `invoice_payload`, deny anything you don't recognize. you have 10 seconds total; don't do slow I/O here

**successfulPayment** carries the `telegram_payment_charge_id` you need for `refundStarPayment` and `editUserStarSubscription` — store it. for subscriptions, `isFirstRecurring=true` on the initial payment and `isRecurring=true` on every renewal, with `subscriptionExpirationDate` set on every recurring payment

### stars-specific quirks

- `currency: 'XTR'` and `provider_token: ''` (empty string, not omitted) — that's how the bot api routes the invoice to stars
- exactly one `LabeledPrice` item for stars invoices — multi-item breakdown only works for fiat
- `subscription_period` must be exactly `2592000` (30 days) — no other intervals supported as of writing
- subscriptions can be cancelled via `editUserStarSubscription` with `is_canceled: true` — the active period continues until expiry, but renewal won't fire
- refunds via `refundStarPayment` work within 21 days of the original payment; outside that window the call fails and you have to manually compensate the user

### the in-memory store

`src/store.ts` is a deliberately simple `Map<userId, UserState>` — fine for a demo, but real bots need persistence: lose this map on restart and you lose every charge id, which means no refunds and no cancellations. swap for `@puregram/storage` (or any kv store) in production

## see also

- [bot api payments docs](https://core.telegram.org/bots/payments)
- [bot api stars guide](https://core.telegram.org/bots/payments/stars)
