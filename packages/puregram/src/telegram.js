let https = require('https');

let API = require('./api');
let Updates = require('./updates');

class Telegram {
  constructor({
    token,
    apiUrl = 'https://api.telegram.org/bot',
    agent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 1000,
    })
  }) {
    this.token = token;
    this.baseApiUrl = `${apiUrl}${this.token}`;
    this.agent = agent;

    if (this.baseApiUrl.startsWith('http://')) {
      this.agent = null;
    }

    this.api = new API(this);
    this.updates = new Updates(this);
  }
}

module.exports = Telegram;
