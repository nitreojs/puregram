let API = require('./api');
let Updates = require('./updates');

class Telegram {
  constructor({
    token,
  }) {
    this.token = token;

    this.api = new API(this);
    this.updates = new Updates(this);
  }
}

module.exports = Telegram;
