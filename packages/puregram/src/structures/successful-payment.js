let { inspect } = require('util');

class SuccessfulPayment {
  constructor(payload) {
    this.payload = payload;
  }

  get currency() {
    return this.payload.currency;
  }

  get totalAmount() {
    return this.payload.total_amount;
  }

  get invoicePayload() {
    return this.payload.invoice_payload;
  }

  get shippingOptionId() {
    return this.payload.shipping_option_id || null;
  }

  get orderInfo() {
    return this.payload.order_info || null;
  }

  get telegramPaymentChargeId() {
    return this.payload.telegram_payment_charge_id;
  }

  get providerPaymentChargeId() {
    return this.payload.provider_payment_charge_id;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      currency: this.currency,
      totalAmount: this.totalAmount,
      invoicePayload: this.invoicePayload,
      shippingOptionId: this.shippingOptionId,
      orderInfo: this.orderInfo,
      telegramPaymentChargeId: this.telegramPaymentChargeId,
      providerPaymentChargeId: this.providerPaymentChargeId,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = SuccessfulPayment;
