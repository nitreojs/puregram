let { inspect } = require('util');

let { filterPayload } = require('../utils');

class MessageEntity {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return this.payload.type;
  }

  get offset() {
    return this.payload.offset;
  }

  get length() {
    return this.payload.length;
  }

  get url() {
    return this.payload.url || null;
  }

  get user() {
    return this.payload.user || null;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      type: this.type,
      offset: this.offset,
      length: this.length,
      url: this.url,
      user: this.user,
    };

    payloadToInspect = filterPayload(payloadToInspect);

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = MessageEntity;
