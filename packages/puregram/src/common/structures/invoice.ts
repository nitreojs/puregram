import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** This object contains basic information about an invoice. */
export class Invoice {
  constructor(private payload: Interfaces.TelegramInvoice) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Product name */
  get title() {
    return this.payload.title
  }

  /** Product description */
  get description() {
    return this.payload.description
  }

  /**
   * Unique bot deep-linking parameter that can be used to generate this
   * invoice
   */
  get startParameter() {
    return this.payload.start_parameter
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
}

inspectable(Invoice, {
  serialize(struct) {
    return {
      title: struct.title,
      description: struct.description,
      startParameter: struct.startParameter,
      currency: struct.currency,
      totalAmount: struct.totalAmount
    }
  }
})
