import { Telegram, KeyboardBuilder } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => {
  const keyboard = new KeyboardBuilder()
    .textButton('some button')
    .row()
    .textButton('two buttons')
    .textButton('in one row')
    .resize() // INFO: keyboard will be much smaller

  return context.send('sending you a keyboard, generated using `KeyboardBuilder`!', {
    reply_markup: keyboard,
    parse_mode: 'markdown'
  })
})

telegram.updates.startPolling().then(
  () => console.log(`bot @${telegram.bot.username} started polling`)
).catch(console.error)
