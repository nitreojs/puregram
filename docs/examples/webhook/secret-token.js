// INFO: Telegram allows you to pass `secret_token` to `setWebhook` method
// INFO: this way all Telegram requests will have a `X-Telegram-Bot-Api-Secret-Token` header,
//         by which you can tell if the request was sent by you or not

import express from 'express'

import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)
const app = express()

app.use(express.json()) // <-- IMPORTANT
app.use(telegram.updates.getWebhookMiddleware('important-secret-token')) // <-- passing 'important-secret-token' as a secret token

// INFO: also, you will need to call setWebhook at least once
// INFO: passing our 'important-secret-token' here ONCE
// telegram.api.setWebhook({ url: process.env.WEBHOOK_URL, secret_token: 'important-secret-token' })

telegram.updates.on('message', context => context.send('handled message with a `secret_token` via `express`'))

// INFO: remember that Telegram supports only these ports for Webhook: 443, 80, 88, 8443
// INFO: https://core.telegram.org/bots/api#setwebhook
app.listen(8443, () => console.log('started'))
