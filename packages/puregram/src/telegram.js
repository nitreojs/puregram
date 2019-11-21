let API = require('./api');
let Updates = require('./updates');

class Telegram {
  constructor({
    token,
    apiUrl = 'api.telegram.org/bot',
    https = true,
  }) {
    this.token = token;
    this.baseApiUrl = `http${https ? 's' : ''}://${apiUrl}${this.token}`;

    this.api = new API(this);
    this.updates = new Updates(this);
  }
}

module.exports = Telegram;
