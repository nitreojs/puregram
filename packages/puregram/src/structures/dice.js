let { inspect } = require('util');

let emojiTypes = {
  '🎲': 'dice',
  '🎯': 'darts',
  '🏀': 'ball'
};

class Dice {
  constructor(payload) {
    this.payload = payload;
  }

  get emoji() {
    return this.payload.emoji;
  }

  get value() {
    return this.payload.value;
  }

  get type() {
    return emojiTypes[this.emoji];
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      value: this.value,
      emoji: this.emoji,
      type: this.type
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = Dice;
