import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => message.send('pong'))

// startWebhook calls setWebhook on the telegram api and starts a node http server in one shot
const { stop } = await telegram.startWebhook({
  url: process.env.WEBHOOK_URL!,
  port: Number(process.env.PORT ?? 3000),
  ...(process.env.WEBHOOK_SECRET !== undefined && { secretToken: process.env.WEBHOOK_SECRET })
})

process.on('SIGINT', async () => {
  await stop()
  process.exit(0)
})
