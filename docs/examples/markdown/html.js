import { Telegram, HTML } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => {
  const message = `a ${HTML.bold('message')} with ${HTML.italic('html markdown')}!`
  const anotherMessage = 'another <b>message</b> with <i>html markdown</i>.'

  await Promise.all([
    context.send(message, { parse_mode: 'html' }), // <-- note how we are telling telegram
    context.send(anotherMessage, { parse_mode: 'html' }) // that there are some html entities in the message
  ])
})

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
