import { inspectable } from 'inspectable'

import { TelegramPreCheckoutQuery } from '../generated/telegram-interfaces'
import { User } from '../common/structures/user'
import { OrderInfo } from '../common/structures/order-info'
import { filterPayload } from '../utils/helpers'

export class PreCheckoutQuery {
  constructor(public payload: TelegramPreCheckoutQuery) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Unique query identifier */
  get id() {
    return this.payload.id
  }

  /** User who sent the query */
  get from() {
    return new User(this.payload.from)
  }

  /** Sender ID */
  get senderId() {
    return this.from.id
  }

  /** Three-letter ISO 4217 currency code */
  get currency() {
    return this.payload.currency
  }

  /**
   * Total price in the smallest units of the currency
   * (integer, not float/double). For example, for a price of
   * `US$ 1.45` pass `amount = 145`. See the `exp` parameter in
   * [currencies.json](https://core.telegram.org/bots/payments/currencies.json),
   * it shows the number of digits past the decimal point for each currency
   * (2 for the majority of currencies).
   */
  get totalAmount() {
    return this.payload.total_amount
  }

  /** Bot specified invoice payload */
  get invoicePayload() {
    return this.payload.invoice_payload
  }

  /** Identifier of the shipping option chosen by the user */
  get shippingOptionId() {
    return this.payload.shipping_option_id
  }

  /** Order info provided by the user */
  get orderInfo() {
    const { order_info } = this.payload

    if (!order_info) {
      return
    }

    return new OrderInfo(order_info)
  }
}

inspectable(PreCheckoutQuery, {
  serialize(query) {
    const payload = {
      id: query.id,
      from: query.from,
      senderId: query.senderId,
      currency: query.currency,
      totalAmount: query.totalAmount,
      invoicePayload: query.invoicePayload,
      shippingOptionId: query.shippingOptionId,
      orderInfo: query.orderInfo
    }

    return filterPayload(payload)
  }
})
