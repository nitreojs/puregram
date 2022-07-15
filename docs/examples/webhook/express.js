import express from 'express'

import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)
const app = express()

app.use(express.json()) // <-- IMPORTANT
app.use(telegram.updates.getWebhookMiddleware())

// INFO: also, you will need to call setWebhook at least once
// telegram.api.setWebhook({ url: process.env.WEBHOOK_URL })

telegram.updates.on('message', context => context.send('handled message via `express`'))

// INFO: Remember that Telegram supports only these ports for Webhook: 443, 80, 88, 8443
// INFO: https://core.telegram.org/bots/api#setwebhook
app.listen(8443, () => console.log('started'))
