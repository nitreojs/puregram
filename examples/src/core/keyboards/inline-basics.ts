import { Telegram, InlineKeyboard } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  // each row is an array of buttons; rows themselves are the outer array
  // `InlineKeyboard.<kind>Button(...)` returns a button object you drop into a row
  const keyboard = InlineKeyboard.keyboard([
    [
      InlineKeyboard.textButton({ text: 'callback', payload: 'pong' }),
      InlineKeyboard.urlButton({ text: 'open url', url: 'https://core.telegram.org/bots' })
    ],
    [
      InlineKeyboard.webAppButton({ text: 'web app', url: 'https://example.com/app' })
    ]
  ])

  return message.send('pick one', { reply_markup: keyboard })
})

// the button tap arrives as a `callback_query` update
// `query.data` is the raw payload string you set above (`'pong'`)
telegram.onCallbackQuery((query) => {
  return query.answer({ text: `you tapped: ${query.data ?? '?'}` })
})

await telegram.startPolling()
