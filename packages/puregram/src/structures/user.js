let { inspect } = require('util');

let { filterPayload } = require('../utils');

class User {
  constructor(payload) {
    this.payload = payload;
  }

  get id() {
    return this.payload.id;
  }

  get isBot() {
    return this.payload.is_bot;
  }

  get firstName() {
    return this.payload.first_name || null;
  }

  get lastName() {
    return this.payload.last_name || null;
  }

  get username() {
    return this.payload.username || null;
  }

  get languageCode() {
    return this.payload.language_code || null;
  }

  get canJoinGroups() {
    return this.payload.can_join_groups || null;
  }

  get canReadAllGroupMessages() {
    return this.payload.can_read_all_group_messages || null;
  }

  get supportsInlineQueries() {
    return this.payload.supports_inline_queries || null;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      id: this.id,
      isBot: this.isBot,
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      languageCode: this.languageCode,
    };

    payloadToInspect = filterPayload(payloadToInspect);

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = User;
