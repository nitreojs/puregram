import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => {
  if (context.text && /hello/i.test(context.text)) {
    return context.send('hello, World!')
  }
})

telegram.updates.startPolling().then(
  () => console.log(`started polling @${telegram.bot.username}`)
).catch(console.error)
