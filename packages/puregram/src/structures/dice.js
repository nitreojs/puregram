let { inspect } = require('util');

class Chat {
  constructor(payload) {
    this.payload = payload;
  }

  get value() {
    return this.payload.value;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      id: this.id,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = Chat;
