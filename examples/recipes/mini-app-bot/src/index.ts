import { createBot } from './bot'
import { createServer } from './server'

const token = process.env.TOKEN

if (token === undefined || token === '') {
  console.error('set TOKEN= in .env')
  process.exit(1)
}

const publicUrl = process.env.PUBLIC_URL

if (publicUrl === undefined || !publicUrl.startsWith('https://')) {
  console.error('set PUBLIC_URL= in .env (must be https — telegram refuses http)')
  process.exit(1)
}

const port = Number.parseInt(process.env.PORT ?? '3000', 10)

const { telegram } = createBot({ token, publicUrl })
const server = createServer({ telegram, token, port })

await server.listen()
console.log(`[mini-app-bot] fastify listening on :${port}, exposed as ${publicUrl}`)

await telegram.start()
console.log(`[mini-app-bot] logged in as @${telegram.bot.username ?? '<unknown>'}`)
console.log('[mini-app-bot] send /start to your bot and tap the settings button')

await telegram.startPolling()
