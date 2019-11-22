let { Telegram } = require('puregram');

let telegram = new Telegram({
  token: process.env.TOKEN,
});

telegram.updates.on('message', (context) => {
  if (/hello/i.test(context.text)) {
    return context.send('World!');
  }
});

telegram.updates.startPolling();
