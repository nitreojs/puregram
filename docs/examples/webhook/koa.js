const Koa = require('koa');
const koaBody = require('koa-body');

const { Telegram } = require('puregram');

const telegram = new Telegram({ token: process.env.TOKEN });
const app = new Koa();

app.use(koaBody()); // <-- IMPORTANT
app.use(telegram.updates.getKoaMiddleware());

// Also, you will need to call setWebhook at least once:
telegram.api.setWebhook({
  url: process.env.WEBHOOK_URL
});

telegram.updates.on(
  'message',
  (context) => context.send('Handled message via koa')
);

// Remember that Telegram supports only these ports for Webhook:
// 443, 80, 88, 8443
// https://core.telegram.org/bots/api#setwebhook
app.listen(8443, () => console.log('Started'));
