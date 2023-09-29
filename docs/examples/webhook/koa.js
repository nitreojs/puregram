import Koa from 'koa'
import koaBody from 'koa-body'

import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)
const app = new Koa()

app.use(koaBody()) // <-- IMPORTANT
app.use(telegram.updates.getKoaMiddleware())

// INFO: also, you will need to call setWebhook at least once
// telegram.api.setWebhook({ url: process.env.WEBHOOK_URL })

telegram.updates.on('message', context => context.send('handled message via `koa`'))

// INFO: remember that Telegram supports only these ports for Webhook: 443, 80, 88, 8443
// INFO: https://core.telegram.org/bots/api#setwebhook
app.listen(8443, () => console.log('started'))
