let { Telegram } = require('puregram');

let telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.hear(
  /^hello/i,
  context => context.send('World!')
);

telegram.updates.startPolling().then(
  () => console.log('Started polling')
).catch(console.error);
