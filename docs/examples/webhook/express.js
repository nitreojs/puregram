import express from 'express';
import bodyParser from 'body-parser';

import { Telegram } from 'puregram';

const telegram = new Telegram({ token: process.env.TOKEN });
const app = express();

app.use(bodyParser.json()); // <-- IMPORTANT
app.use(telegram.updates.getWebhookMiddleware());

// Also, you will need to call setWebhook at least once:
telegram.api.setWebhook({
  url: process.env.WEBHOOK_URL
});

telegram.updates.on(
  'message',
  (context) => context.send('Handled message via express')
);

// Remember that Telegram supports only these ports for Webhook:
// 443, 80, 88, 8443
// https://core.telegram.org/bots/api#setwebhook
app.listen(8443, () => console.log('Started'));
