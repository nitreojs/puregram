import { Telegram } from 'puregram'
import { session } from '@puregram/session'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', session()) // will have `session` property in `context` on every `message` update

telegram.updates.on('message', (context) => {
  // since this is a `message` update, we can be sure that `context.session` will be present
  if (!('counter' in context.session)) {
    context.session.counter = 0
  }

  context.session.counter += 1

  return context.send(`counter: *${context.session.counter}*`, { parse_mode: 'Markdown' })
})

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
