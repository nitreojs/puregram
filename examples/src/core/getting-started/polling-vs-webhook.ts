import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage(message => message.send('pong'))

// polling: tg long-polls the bot api and dispatches updates as they arrive
// great for dev, no inbound network requirement, no public url needed
if (process.env.MODE === 'polling') {
  await telegram.startPolling()
}

// webhook: telegram pushes updates to a public https url you control
// `startWebhook` registers the webhook and starts an http server in one call
if (process.env.MODE === 'webhook') {
  await telegram.startWebhook({
    url: process.env.WEBHOOK_URL!,
    port: 3000
  })
}
