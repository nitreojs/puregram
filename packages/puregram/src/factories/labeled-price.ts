import type { TelegramLabeledPrice } from '@puregram/api'

/**
 * static factories for `LabeledPrice` — used in invoices (sendInvoice,
 * createInvoiceLink, answerShippingQuery)
 *
 * @example
 * ```ts
 * tg.api.sendInvoice({
 *   chat_id, title, description, payload, currency: 'USD',
 *   prices: [LabeledPrice.of('apple', 145), LabeledPrice.of('shipping', 500)]
 * })
 * ```
 */
export class LabeledPrice {
  /** single labeled price portion. amount is in the currency's smallest units (e.g. cents) */
  static of (label: string, amount: number): TelegramLabeledPrice {
    return { label, amount }
  }
}
