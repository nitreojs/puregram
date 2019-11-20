let { inspect } = require('util');

let Context = require('./context');

let User = require('../structures/user');

let { filterPayload } = require('../utils');

class InlineQuery extends Context {
  constructor(telegram, update) {
    super(telegram, 'inline_query');

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

  get location() {
    return this.update.location || null;
  }

  get query() {
    return this.update.query;
  }

  get offset() {
    return this.update.offset;
  }

  answerInlineQuery(results, params = {}) {
    return this.telegram.api.answerInlineQuery({
      inline_query_id: this.id,
      results: JSON.stringify(results),
      ...params,
    });
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      id: this.id,
      from: this.from,
      senderId: this.senderId,
      location: this.location,
      query: this.query,
    };

    let filtered = filterPayload(payloadToInspect);

    let payload = inspect(filtered, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = InlineQuery;
