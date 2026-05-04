import { Telegram, InlineKeyboard } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  return message.send('press the button', {
    reply_markup: InlineKeyboard.keyboard([[
      InlineKeyboard.textButton({ text: 'press me', payload: 'pressed' })
    ]])
  })
})

telegram.onCallbackQuery(async (query) => {
  // every query must be answered within 15s — otherwise the user sees a loading spinner forever
  await query.answer({ text: `you sent: ${query.data ?? 'no data'}`, show_alert: true })

  // `query.chatId` and `query.messageId` are shortcuts on the callback query update
  // both may be undefined when the query came from an inline message (not a chat message)
  if (query.chatId !== undefined && query.messageId !== undefined) {
    await telegram.api.editMessageText({
      chat_id: query.chatId,
      message_id: query.messageId,
      text: 'tapped'
    })
  }
})

await telegram.startPolling()
