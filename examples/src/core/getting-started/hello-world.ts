import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

// every update kind has a matching `on<Kind>` registrar
// the handler is called with a wrapped update — typed shortcuts, raw payload via `.raw`
telegram.onMessage((message) => {
  if (message.hasText() && /^\/hello/i.test(message.text)) {
    return message.send('hello, world!')
  }
})

await telegram.startPolling()

console.log(`started polling @${telegram.bot.username}`)

