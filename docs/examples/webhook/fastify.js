import Fastify from 'fastify'
import middie from '@fastify/middie' // using @fastify/middie for middleware support

import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)
const fastify = Fastify()

// INFO: also, you will need to call setWebhook at least once
// telegram.api.setWebhook({ url: process.env.WEBHOOK_URL })

telegram.updates.on('message', context => context.send('handled message via `fastify`'))
const main = async () => {
  await fastify.register(middie)

  fastify.use(telegram.updates.getWebhookMiddleware())

  // INFO: Remember that Telegram supports only these ports for Webhook: 443, 80, 88, 8443
  // INFO: https://core.telegram.org/bots/api#setwebhook
  fastify.listen({ port: 8443 }, () => console.log('started'))
}

main().catch(console.error)
