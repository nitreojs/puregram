import { Telegram, Keyboard } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  // reply keyboards replace the user's keyboard input with custom buttons
  // taps arrive as regular `message` updates with the button text as `message.text`
  const keyboard = Keyboard.keyboard([
    [
      Keyboard.textButton('plain'),
      Keyboard.requestContactButton('share contact')
    ],
    [
      // `requestPollButton` receives a string type or `{ type }` object
      Keyboard.requestPollButton('create poll', { type: 'regular' })
    ]
  ])
    .resize()
    .oneTime()

  return message.send('pick one', { reply_markup: keyboard })
})

await telegram.startPolling()
