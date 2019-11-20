let { inspect } = require('util');

let Context = require('./context');

let User = require('../structures/user');

let { filterPayload } = require('../utils');

class ChosenInlineResult extends Context {
  constructor(telegram, update) {
    super(telegram, 'chosen_inline_result');

    this.update = update;
  }

  get id() {
    return this.update.result_id;
  }

  get from() {
    return new User(this.update.from);
  }

  get senderId() {
    return this.from.id;
  }

  get query() {
    return this.update.query;
  }

  get location() {
    return this.update.location || null;
  }

  get inlineMessageId() {
    return this.update.inline_message_id || null;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      id: this.id,
      from: this.from,
      senderId: this.senderId,
      query: this.query,
      location: this.location,
      inlineMessageId: this.inlineMessageId,
    };

    let filtered = filterPayload(payloadToInspect);

    let payload = inspect(filtered, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = ChosenInlineResult;
