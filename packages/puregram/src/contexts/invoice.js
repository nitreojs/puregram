let { inspect } = require('util');

let Context = require('./context');

let User = require('../structures/user');
let Chat = require('../structures/chat');

let InvoiceStructure = require('../structures/invoice');

class Invoice extends Context {
  constructor(telegram, update) {
    super(telegram, 'invoice');

    this.update = update;
  }

  get id() {
    return this.update.message_id;
  }

  get from() {
    let { from } = this.update;

    if (!from) return null;

    return new User(from);
  }

  get senderId() {
    return this.from ? this.from.id : null;
  }

  get date() {
    return this.update.date || null;
  }

  get chat() {
    let { chat } = this.update;

    return new Chat(chat);
  }

  get chatId() {
    return this.chat.id;
  }

  get chatType() {
    return this.chat.type;
  }

  get eventInvoice() {
    return new InvoiceStructure(this.update.invoice);
  }

  async sendDice(chatId = this.chatId) {
    let response = await this.telegram.api.sendDice({
      chat_id: chatId
    });

    return new MessageContext(this.telegram, response);
  }

  getMyCommands() {
    return this.telegram.api.getMyCommands();
  }

  setMyCommands() {
    return this.telegram.api.setMyCommands();
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      id: this.id,
      from: this.from,
      senderId: this.senderId,
      date: this.date,
      chat: this.chat,
      chatId: this.chatId,
      chatType: this.chatType,
      eventInvoice: this.eventInvoice,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = Invoice;
