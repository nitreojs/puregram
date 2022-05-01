import { Telegram } from 'puregram'

const telegram = new Telegram({
  token: process.env.TOKEN
})

telegram.updates.on('message', (context) => {
  if (context.text && /hello/i.test(context.text)) {
    return context.send('Hello, World!')
  }
})

telegram.updates.startPolling().then(
  () => console.log(`Started polling @${telegram.bot.username}`)
).catch(console.error)
