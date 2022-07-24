import { Telegram } from 'puregram'
import { SessionManager } from '@puregram/session'

const telegram = Telegram.fromToken(process.env.TOKEN)

const sessionManager = new SessionManager()

telegram.updates.on('message', sessionManager.middleware)

telegram.updates.on('message', (context) => {
  if (!context.session.counter) {
    context.session.counter = 0
  }

  context.session.counter += 1

  return context.send(`counter: *${context.session.counter}*`, { parse_mode: 'Markdown' })
})

telegram.updates.startPolling().then(
  () => console.log(`started polling @${telegram.bot.username}`)
).catch(console.error)
