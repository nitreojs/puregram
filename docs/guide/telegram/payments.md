---
title: payments
description: LabeledPrice and ShippingOption factories, sending invoices, handling the shipping and pre-checkout flow, and paid media
---

# payments

puregram covers telegram's payment flow end to end: `LabeledPrice` and `ShippingOption` for building the price breakdown and shipping choices, `sendInvoice` / `createInvoiceLink` for issuing invoices, and the `shipping_query` → `pre_checkout_query` → `successful_payment` handler sequence

```ts
import { LabeledPrice } from 'puregram'

await tg.api.sendInvoice({
  chat_id,
  title: 'premium subscription',
  description: 'one month of access',
  payload: 'sub_1m',
  currency: 'USD',
  prices: [LabeledPrice.of('subscription', 499)]
})
```

## LabeledPrice

`LabeledPrice` builds a single `TelegramLabeledPrice` — a labeled portion of the total price. amounts are in the currency's **smallest unit** (cents for USD, etc.)

```ts
import { LabeledPrice } from 'puregram'

// $4.99 product + $1.00 tax
const prices = [
  LabeledPrice.of('item', 499),
  LabeledPrice.of('tax', 100)
]
```

### factory

`LabeledPrice.of(label, amount)` — `label` is the human-visible description, `amount` is an integer in the currency's smallest unit

```ts
// telegram stars invoice — one item, currency "XTR", no provider token needed
await tg.api.sendInvoice({
  chat_id,
  title: 'extra lives',
  description: '5 extra lives in the game',
  payload: 'lives_5',
  currency: 'XTR',
  prices: [LabeledPrice.of('5 lives', 50)]  // 50 stars
})
```

::: tip telegram stars
for in-app star payments pass `currency: 'XTR'` and omit `provider_token`. the `prices` array must contain exactly one item. tips and shipping are not supported for star payments
:::

## ShippingOption

`ShippingOption` builds a `TelegramShippingOption` — an id, title, and price breakdown — passed to `answerShippingQuery` when the user requests shipping options

```ts
import { LabeledPrice, ShippingOption } from 'puregram'

const options = [
  ShippingOption.of('std', 'standard (5–7 days)', [LabeledPrice.of('shipping', 500)]),
  ShippingOption.of('exp', 'express (1–2 days)',  [LabeledPrice.of('shipping', 1500)])
]
```

### factory

`ShippingOption.of(id, title, prices)` — `id` is your internal identifier, `title` is shown to the user, `prices` is an array of `LabeledPrice` portions

## Invoice

`LabeledPrice` builds the line items; `Invoice` builds the whole invoice body — and encodes telegram's payments split as types. `Invoice.stars(...)` pins `currency` to `'XTR'`, sends an empty `provider_token`, allows `subscriptionPeriod`, and rejects the fiat-only knobs (tips, shipping, `is_flexible`). `Invoice.fiat(...)` requires a `providerToken` + ISO 4217 `currency`, allows tips/shipping/flexible, and rejects `subscriptionPeriod`. pass the wrong field and it's a compile error, not a runtime `400`

```ts
import { Invoice, LabeledPrice } from 'puregram'

// telegram stars — currency is forced to XTR; `providerToken` won't even typecheck here
const link = await tg.api.createInvoiceLink(Invoice.stars({
  title: 'pro plan', description: 'monthly', payload: 'sub_pro',
  prices: [LabeledPrice.of('1 month', 250)],   // amount = stars
  subscriptionPeriod: 2_592_000                 // 30 days, xtr-only
}))

// fiat — provider token + currency required; spread into sendInvoice with a chat_id
await tg.api.sendInvoice({
  chat_id,
  ...Invoice.fiat({
    title: 'coffee', description: 'a good cup', payload: 'order_42',
    providerToken: process.env.PROVIDER_TOKEN!,
    currency: 'EUR',
    prices: [LabeledPrice.of('cup', 500), LabeledPrice.of('shipping', 150)],
    isFlexible: true
  })
})
```

the result carries only the invoice-definition fields (no `chat_id`, no delivery options) — spread it into `sendInvoice` or pass it straight to `createInvoiceLink`. add `business_connection_id` at the call site (or use `tg.business(...)`)

## the payment flow

telegram's payment flow has four stages. all four update kinds are first-class in puregram:

```
sendInvoice / createInvoiceLink
        ↓
  user fills address  →  shipping_query  (if is_flexible)
        ↓
  user confirms       →  pre_checkout_query  (always)
        ↓
  payment succeeds    →  successful_payment  (service event on the message)
```

### sending an invoice

`tg.api.sendInvoice` sends a payment invoice directly into a chat. `tg.api.createInvoiceLink` produces a shareable link instead

```ts
await tg.api.sendInvoice({
  chat_id,
  title: 'premium subscription',
  description: 'one month of access',
  payload: 'sub_1m',          // your internal reference — comes back in queries
  currency: 'USD',
  prices: [
    LabeledPrice.of('subscription', 499),
    LabeledPrice.of('service fee', 50)
  ],
  provider_token: process.env.PAYMENT_TOKEN,
  need_name: true,
  need_email: true,
  is_flexible: true            // set to true when shipping is required
})
```

key `sendInvoice` fields:

| field | notes |
|---|---|
| `payload` | 1–128 bytes, not shown to the user — echoed back in all three query updates |
| `currency` | ISO 4217 or `'XTR'` for telegram stars |
| `prices` | array of `LabeledPrice.of(...)` |
| `provider_token` | omit or pass `''` for star payments |
| `is_flexible` | `true` triggers `shipping_query` before checkout |
| `need_name / need_email / need_phone_number / need_shipping_address` | request user info |

### handling shipping_query

when `is_flexible: true`, telegram sends a `shipping_query` update before the user can proceed. respond via `update.answer(...)` or `tg.api.answerShippingQuery`:

```ts
tg.on('shipping_query', async (query) => {
  if (query.invoicePayload !== 'sub_1m') {
    return query.answer({ ok: false, error_message: 'unknown product' })
  }

  await query.answer({
    ok: true,
    shipping_options: [
      ShippingOption.of('std', 'standard', [LabeledPrice.of('shipping', 0)]),
      ShippingOption.of('exp', 'express',  [LabeledPrice.of('shipping', 500)])
    ]
  })
})
```

`query.answer(params)` is a shortcut for `tg.api.answerShippingQuery` — it fills `shipping_query_id` from the update automatically

### handling pre_checkout_query

after the user confirms their order, telegram sends a `pre_checkout_query`. **you must respond within 10 seconds** — either confirm or abort:

```ts
tg.on('pre_checkout_query', async (query) => {
  // validate stock, pricing, anything that can still fail
  const valid = await validateOrder(query.invoicePayload)

  if (!valid) {
    return query.answer({ ok: false, error_message: 'item no longer available' })
  }

  await query.answer({ ok: true })
})
```

`query.answer(params)` shortcut fills `pre_checkout_query_id` automatically

`PreCheckoutQueryUpdate` exposes:
- `query.id` — unique query id (filled by the shortcut)
- `query.from` — the user
- `query.currency` — ISO 4217 / `'XTR'`
- `query.totalAmount` — total in smallest currency units
- `query.invoicePayload` — your payload string from `sendInvoice`
- `query.shippingOptionId` — chosen shipping option id, if any
- `query.orderInfo` — user-provided order info, if any

### successful payment

when the payment clears, telegram delivers a `successful_payment` service event (a `MessageUpdate` with `successful_payment` set). handle it to provision what was purchased:

```ts
tg.on('successful_payment', (message) => {
  const payment = message.raw.successful_payment
  // payment.invoice_payload, payment.currency, payment.total_amount, etc.
  console.log('paid', payment?.total_amount, payment?.currency)
})
```

::: tip payload-scoped filters
`shippingPayload`, `preCheckoutPayload`, and `successfulPaymentPayload` filters let you register handlers for a specific `invoice_payload` value without a manual equality check:

```ts
import { shippingPayload, preCheckoutPayload } from 'puregram'

tg.on(shippingPayload('sub_1m'), async (query) => { /* ... */ })
tg.on(preCheckoutPayload('sub_1m'), async (query) => { /* ... */ })
```

import these from `'puregram'` — they live in `packages/puregram/src/filters/payments.ts`
:::

## paid media

`sendPaidMedia` lets you gate photos and videos behind a star payment. the user pays `star_count` stars to unlock the media

```ts
await tg.api.sendPaidMedia({
  chat_id,
  star_count: 10,
  media: [
    { type: 'photo', media: 'attach://photo.jpg' }
  ],
  caption: 'exclusive content'
})
```

when a user buys access, telegram fires a `purchased_paid_media` update with `update.from` (the buyer) and `update.paidMediaPayload` (the optional bot-defined payload you passed to `sendPaidMedia`)

```ts
tg.on('purchased_paid_media', (update) => {
  console.log(update.from.id, 'purchased', update.paidMediaPayload)
})
```

## see also

- [messages & media](/guide/telegram/messages-and-media) — sending files and media
- [dispatch & filters](/guide/handling-updates/dispatch-and-filters) — registering `shipping_query` / `pre_checkout_query` handlers
- [service events](/guide/handling-updates/service-events) — `successful_payment` as a service event
- [methods](/api/methods) — full generated method list
