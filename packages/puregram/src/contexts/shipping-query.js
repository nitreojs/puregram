let { inspect } = require('util');

let Context = require('./context');

let User = require('../structures/user');

let { filterPayload } = require('../utils');

class ShippingQuery extends Context {
  constructor(telegram, update) {
    super(telegram, 'shipping_query');

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

  get invoicePayload() {
    return this.update.invoice_payload || null;
  }

  get shippingAddress() {
    return this.update.shipping_address || null;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      id: this.id,
      from: this.from,
      senderId: this.senderId,
      invoicePayload: this.invoicePayload,
      shippingAddress: this.shippingAddress,
    };

    let filtered = filterPayload(payloadToInspect);

    let payload = inspect(filtered, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = ShippingQuery;
