import type { CreateInvoiceLinkParams } from '@puregram/api'

import { type Camelize, unCamelize } from './camelize'

// the invoice-definition fields shared by sendInvoice + createInvoiceLink. business_connection_id is
// left out — add it at the call site (or via `tg.business(id)`) since it only applies to stars links
type InvoiceBody = Omit<CreateInvoiceLinkParams, 'business_connection_id'>

type CamelInvoice = Camelize<CreateInvoiceLinkParams>

// telegram stars: currency is pinned to "XTR" and provider_token is empty, so neither is accepted here.
// tips, shipping, the need_*/send_* flags and is_flexible are ignored for stars, so they are omitted too
type StarsInput =
  Pick<CamelInvoice, 'title' | 'description' | 'payload' | 'prices'>
  & Partial<Pick<CamelInvoice, 'subscriptionPeriod' | 'providerData' | 'photoUrl' | 'photoSize' | 'photoWidth' | 'photoHeight'>>

// fiat: provider token + ISO 4217 currency are required; subscription_period is stars-only and omitted
type FiatInput =
  Pick<CamelInvoice, 'title' | 'description' | 'payload' | 'currency' | 'prices'>
  & { providerToken: string }
  & Partial<Pick<CamelInvoice,
    | 'maxTipAmount'
    | 'suggestedTipAmounts'
    | 'providerData'
    | 'photoUrl'
    | 'photoSize'
    | 'photoWidth'
    | 'photoHeight'
    | 'needName'
    | 'needPhoneNumber'
    | 'needEmail'
    | 'needShippingAddress'
    | 'sendPhoneNumberToProvider'
    | 'sendEmailToProvider'
    | 'isFlexible'
  >>

/**
 * static factories for invoice bodies shared by `sendInvoice` and `createInvoiceLink`.
 *
 * the two variants encode telegram's payment split as types rather than runtime errors:
 * `Invoice.stars` pins `currency` to `"XTR"`, sends an empty `provider_token`, and rejects the fiat-only
 * knobs (tips, shipping, `is_flexible`) while allowing `subscriptionPeriod`; `Invoice.fiat` requires a
 * `providerToken` + ISO 4217 `currency`, allows tips/shipping/flexible, and rejects `subscriptionPeriod`.
 *
 * the result carries every invoice-definition field but no delivery field — spread it into `sendInvoice`
 * (with `chat_id`) or pass it straight to `createInvoiceLink`. add `business_connection_id` at the call site.
 *
 * @example
 * ```ts
 * tg.api.sendInvoice({
 *   chat_id,
 *   ...Invoice.fiat({
 *     title: 'Coffee', description: 'a good cup', payload: 'order_42',
 *     providerToken: process.env.PROVIDER_TOKEN!,
 *     currency: 'EUR',
 *     prices: [LabeledPrice.of('cup', 500), LabeledPrice.of('shipping', 150)],
 *     isFlexible: true
 *   })
 * })
 *
 * const link = await tg.api.createInvoiceLink(Invoice.stars({
 *   title: 'Pro plan', description: 'monthly', payload: 'sub_pro',
 *   prices: [LabeledPrice.of('1 month', 250)],
 *   subscriptionPeriod: 2592000
 * }))
 * ```
 */
export class Invoice {
  /** fiat invoice body — `providerToken` + ISO 4217 `currency` required; `subscriptionPeriod` not accepted */
  static fiat (params: FiatInput) {
    return unCamelize(params) as unknown as InvoiceBody
  }

  /** telegram stars invoice body — `currency` is forced to `"XTR"`; fiat-only knobs are not accepted */
  static stars (params: StarsInput) {
    return { ...unCamelize(params), currency: 'XTR', provider_token: '' } as unknown as InvoiceBody
  }
}
