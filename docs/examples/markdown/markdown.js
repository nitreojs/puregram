import { Telegram, Markdown } from 'puregram'

const telegram = new Telegram({
  token: process.env.TOKEN
})

telegram.updates.on('message', (context) => {
  const message = `a ${Markdown.bold('message')} with ${Markdown.italic('markdown')}!`
  const anotherMessage = 'one more *message* with _markdown_, but without a class!'

  await Promise.all([
    context.send(message, { parse_mode: 'markdown' }), // <-- note how we are telling telegram
    context.send(anotherMessage, { parse_mode: 'markdown' }) // that there are some markdown entities in the message
  ])
})

telegram.updates.startPolling().then(
  () => console.log(`started polling @${telegram.bot.username}`)
).catch(console.error)
