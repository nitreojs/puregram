import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { OrderInfo } from './order-info'
import { memoizeGetters } from '../../utils/helpers'

/** This object contains basic information about a successful payment. */
@Inspectable()
export class SuccessfulPayment implements Structure {
  constructor (public payload: Interfaces.TelegramSuccessfulPayment) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Three-letter ISO 4217 currency code */
  @Inspect()
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
  @Inspect()
  get totalAmount () {
    return this.payload.total_amount
  }

  /** Bot specified invoice payload */
  @Inspect()
  get invoicePayload () {
    return this.payload.invoice_payload
  }

  /** Identifier of the shipping option chosen by the user */
  @Inspect({ nullable: false })
  get shippingOptionId () {
    return this.payload.shipping_option_id
  }

  /** Order info provided by the user */
  @Inspect({ nullable: false })
  get orderInfo () {
    const { order_info } = this.payload

    if (!order_info) {
      return
    }

    return new OrderInfo(order_info)
  }

  /** Telegram payment identifier */
  @Inspect()
  get telegramPaymentChargeId () {
    return this.payload.telegram_payment_charge_id
  }

  /** Provider payment identifier */
  @Inspect()
  get providerPaymentChargeId () {
    return this.payload.provider_payment_charge_id
  }

  toJSON () {
    return this.payload
  }
}

memoizeGetters(SuccessfulPayment, ['orderInfo'])
