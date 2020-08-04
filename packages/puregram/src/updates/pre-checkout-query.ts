import { inspectable } from 'inspectable';

import { TelegramPreCheckoutQuery } from '../interfaces';
import { User } from '../common/structures/user';
import { OrderInfo } from '../common/structures/order-info';
import { filterPayload } from '../utils/helpers';

export class PreCheckoutQuery {
  public payload: TelegramPreCheckoutQuery;

  constructor(payload: TelegramPreCheckoutQuery) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Unique query identifier */
  public get id(): string {
    return this.payload.id;
  }

  /** User who sent the query */
  public get from(): User {
    return new User(this.payload.from);
  }

  /** Sender ID */
  public get senderId(): number {
    return this.from.id;
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

  /** Bot specified invoice payload */
  public get invoicePayload(): string {
    return this.payload.invoice_payload;
  }

  /** Identifier of the shipping option chosen by the user */
  public get shippingOptionId(): string | undefined {
    return this.payload.shipping_option_id;
  }

  /** Order info provided by the user */
  public get orderInfo(): OrderInfo | undefined {
    const { order_info } = this.payload;

    if (!order_info) return undefined;

    return new OrderInfo(order_info);
  }
}

inspectable(PreCheckoutQuery, {
  serialize(query: PreCheckoutQuery) {
    const payload = {
      id: query.id,
      from: query.from,
      senderId: query.senderId,
      currency: query.currency,
      totalAmount: query.totalAmount,
      invoicePayload: query.invoicePayload,
      shippingOptionId: query.shippingOptionId,
      orderInfo: query.orderInfo
    };

    return filterPayload(payload);
  }
});
