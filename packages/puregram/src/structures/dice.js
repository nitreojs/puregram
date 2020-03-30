let { inspect } = require('util');

class Dice {
  constructor(payload) {
    this.payload = payload;
  }

  get value() {
    return this.payload.value;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      value: this.value,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = Dice;
