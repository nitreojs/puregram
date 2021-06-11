import { inspectable } from 'inspectable';

import { TelegramInvoice } from '../../telegram-interfaces';

/** This object contains basic information about an invoice. */
export class Invoice {
  private payload: TelegramInvoice;

  constructor(payload: TelegramInvoice) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Product name */
  public get title(): string {
    return this.payload.title;
  }

  /** Product description */
  public get description(): string {
    return this.payload.description;
  }

  /**
   * Unique bot deep-linking parameter that can be used to generate this
   * invoice
   */
  public get startParameter(): string {
    return this.payload.start_parameter;
  }

  /** Three-letter ISO 4217 currency code */
  public get currency(): string {
    return this.payload.currency;
  }

  /**
   * Total price in the smallest units of the currency
   * (integer, not float/double). For example, for a price of
   * `US$ 1.45` pass `amount = 145`. See the `exp` parameter in
   * [currencies.json](https://core.telegram.org/bots/payments/currencies.json),
   * it shows the number of digits past the decimal point for each currency
   * (2 for the majority of currencies).
   */
  public get totalAmount(): number {
    return this.payload.total_amount;
  }
}

inspectable(Invoice, {
  serialize(invoice: Invoice) {
    return {
      title: invoice.title,
      description: invoice.description,
      startParameter: invoice.startParameter,
      currency: invoice.currency,
      totalAmount: invoice.totalAmount
    };
  }
});
