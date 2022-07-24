import { Telegram, Keyboard } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => {
  const keyboard = Keyboard.keyboard([
    [
      Keyboard.textButton('some button')
    ],

    [
      Keyboard.textButton('two buttons'),
      Keyboard.textButton('in one row')
    ]
  ]).resize() // INFO: keyboard will be much smaller

  return context.send('sending you a keyboard, generated using `Keyboard`!', {
    reply_markup: keyboard,
    parse_mode: 'markdown'
  })
})

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
