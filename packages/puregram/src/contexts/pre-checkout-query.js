let { inspect } = require('util');

let Context = require('./context');

let User = require('../structures/user');

let { filterPayload } = require('../utils');

class PreCheckoutQuery extends Context {
  constructor(telegram, update) {
    super(telegram, 'pre_checkout_query');

    this.update = update;
  }

  get id() {
    return this.update.id;
  }

  get from() {
    return new User(this.update.from);
  }

  get senderId() {
    return this.from.id;
  }

  get currency() {
    return this.update.currency;
  }

  get totalAmount() {
    return this.update.total_amount;
  }

  get invoicePayload() {
    return this.update.invoice_payload;
  }

  get shippingOptionId() {
    return this.update.shipping_option_id || null;
  }

  get orderInfo() {
    return this.update.order_info || null;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      id: this.id,
      from: this.from,
      senderId: this.senderId,
      currency: this.currency,
      totalAmount: this.totalAmount,
      invoicePayload: this.invoicePayload,
      shippingOptionId: this.shippingOptionId,
      orderInfo: this.orderInfo,
    };

    let filtered = filterPayload(payloadToInspect);

    let payload = inspect(filtered, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = PreCheckoutQuery;
