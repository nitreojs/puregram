let { inspect } = require('util');

class Invoice {
  constructor(payload) {
    this.payload = payload;
  }

  get title() {
    return this.payload.title;
  }

  get description() {
    return this.payload.description;
  }

  get startParameter() {
    return this.payload.start_parameter;
  }

  get currency() {
    return this.payload.currency;
  }

  get totalAmount() {
    return this.payload.total_amount;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      title: this.title,
      description: this.description,
      startParameter: this.startParameter,
      currency: this.currency,
      totalAmount: this.totalAmount,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = Invoice;
