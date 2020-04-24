let { inspect } = require('util');

class PollOption {
  constructor(payload) {
    this.payload = payload;
  }

  get text() {
    return this.payload.text;
  }

  get voterCount() {
    return this.payload.voter_count;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      text: this.text,
      voterCount: this.voterCount
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = PollOption
