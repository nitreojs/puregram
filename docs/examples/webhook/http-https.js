import http from 'http';
// or
import https from 'https';

import { Telegram } from 'puregram';

const telegram = new Telegram({ token: process.env.TOKEN });
const server = http.createServer(telegram.updates.getWebhookMiddleware());

// Also, you will need to call setWebhook at least once:
telegram.api.setWebhook({
  url: process.env.WEBHOOK_URL
});

telegram.updates.on(
  'message',
  (context) => context.send('Handled message via http[s]')
);

// Remember that Telegram supports only these ports for Webhook:
// 443, 80, 88, 8443
// https://core.telegram.org/bots/api#setwebhook
server.listen(8443, () => console.log('Started'));
