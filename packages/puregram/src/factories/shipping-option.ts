import type { TelegramLabeledPrice, TelegramShippingOption } from '@puregram/api'

/**
 * static factories for `ShippingOption` — passed in `answerShippingQuery`
 *
 * @example
 * ```ts
 * tg.api.answerShippingQuery({
 *   shipping_query_id: q.id, ok: true,
 *   shipping_options: [
 *     ShippingOption.of('std', 'Standard', [LabeledPrice.of('shipping', 500)]),
 *     ShippingOption.of('exp', 'Express',  [LabeledPrice.of('shipping', 1500)])
 *   ]
 * })
 * ```
 */
export class ShippingOption {
  /** assemble a shipping option with id, title, and labeled price portions */
  static of (id: string, title: string, prices: TelegramLabeledPrice[]): TelegramShippingOption {
    return { id, title, prices }
  }
}
