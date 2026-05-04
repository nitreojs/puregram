import Fastify from 'fastify'
import { Telegram } from 'puregram'
import { fastifyAdapter } from 'puregram/webhook'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => message.send('pong'))

// fastifyAdapter wraps the framework-agnostic webhookHandler into a fastify route handler
// fastify auto-parses json bodies, so no raw stream buffering happens here
const handler = fastifyAdapter(telegram.webhookHandler({
  ...(process.env.WEBHOOK_SECRET !== undefined && { secretToken: process.env.WEBHOOK_SECRET })
}))

const app = Fastify()

app.post('/webhook', handler)

await telegram.api.setWebhook({
  url: process.env.WEBHOOK_URL!,
  ...(process.env.WEBHOOK_SECRET !== undefined && { secret_token: process.env.WEBHOOK_SECRET })
})

await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })
