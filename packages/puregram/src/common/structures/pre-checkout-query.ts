import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

import { User } from './user'
import { OrderInfo } from './order-info'

export class PreCheckoutQuery implements Structure {
  constructor (public payload: Interfaces.TelegramPreCheckoutQuery) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique query identifier */
  get id () {
    return this.payload.id
  }

  /** User who sent the query */
  get from () {
    return new User(this.payload.from)
  }

  /** Sender ID */
  get senderId () {
    return this.from.id
  }

  /** Three-letter ISO 4217 currency code */
  get currency () {
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
  get totalAmount () {
    return this.payload.total_amount
  }

  /** Bot specified invoice payload */
  get invoicePayload () {
    return this.payload.invoice_payload
  }

  /** Identifier of the shipping option chosen by the user */
  get shippingOptionId () {
    return this.payload.shipping_option_id
  }

  /** Order info provided by the user */
  get orderInfo () {
    const { order_info } = this.payload

    if (!order_info) {
      return
    }

    return new OrderInfo(order_info)
  }

  toJSON () {
    return this.payload
  }
}

inspectable(PreCheckoutQuery, {
  serialize (struct) {
    const payload = {
      id: struct.id,
      from: struct.from,
      senderId: struct.senderId,
      currency: struct.currency,
      totalAmount: struct.totalAmount,
      invoicePayload: struct.invoicePayload,
      shippingOptionId: struct.shippingOptionId,
      orderInfo: struct.orderInfo
    }

    return filterPayload(payload)
  }
})
