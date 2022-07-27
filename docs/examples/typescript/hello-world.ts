import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN as string)

telegram.updates.on('message', (context) => {
  if (context.hasText() && /hello/i.test(context.text)) {
    return context.send('hello, world!')
  }
})

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
