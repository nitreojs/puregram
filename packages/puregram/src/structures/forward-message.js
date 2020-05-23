let { inspect } = require('util');

let User = require('./user');
let Chat = require('./chat');

let { filterPayload } = require('../utils');

class ForwardMessage {
  constructor(update) {
    this.update = update;
  }

  get from() {
    let { forward_from: forwardFrom } = this.update;

    if (!forwardFrom) return null;

    return new User(forwardFrom);
  }

  get chat() {
    let { forward_from_chat: forwardFromChat } = this.update;

    if (!forwardFromChat) return null;

    return new Chat(forwardFromChat);
  }

  get messageId() {
    return this.update.forward_from_message_id || null;
  }

  get signature() {
    return this.update.forward_signature || null;
  }

  get senderName() {
    return this.update.forward_sender_name || null;
  }

  get createdAt() {
    return this.update.forward_date || null;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      from: this.from,
      chat: this.chat,
      messageId: this.messageId,
      signature: this.signature,
      senderName: this.senderName,
      createdAt: this.createdAt
    };

    let filtered = filterPayload(payloadToInspect);

    let payload = inspect(filtered, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = ForwardMessage;
