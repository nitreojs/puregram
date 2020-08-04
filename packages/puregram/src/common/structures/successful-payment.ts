import { inspectable } from 'inspectable';

import { TelegramSuccessfulPayment } from '../../interfaces';
import { OrderInfo } from './order-info';
import { filterPayload } from '../../utils/helpers';

/** This object contains basic information about a successful payment. */
export class SuccessfulPayment {
  private payload: TelegramSuccessfulPayment;

  constructor(payload: TelegramSuccessfulPayment) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
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

  /** Telegram payment identifier */
  public get telegramPaymentChargeId(): string {
    return this.payload.telegram_payment_charge_id;
  }

  /** Provider payment identifier */
  public get providerPaymentChargeId(): string {
    return this.payload.provider_payment_charge_id;
  }
}

inspectable(SuccessfulPayment, {
  serialize(payment: SuccessfulPayment) {
    const payload = {
      currency: payment.currency,
      totalAmount: payment.totalAmount,
      invoicePayload: payment.invoicePayload,
      shippingOptionId: payment.shippingOptionId,
      orderInfo: payment.orderInfo,
      telegramPaymentChargeId: payment.telegramPaymentChargeId,
      providerPaymentChargeId: payment.providerPaymentChargeId
    };

    return filterPayload(payload);
  }
});
