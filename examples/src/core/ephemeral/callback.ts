import { InlineKeyboard, Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage(async (message) => {
  if (!message.hasText() || !/^\/tip/.test(message.text)) {
    return
  }

  await message.send('tap for a private tip', {
    reply_markup: InlineKeyboard.keyboard([[
      InlineKeyboard.textButton({ text: 'tip', payload: 'tip' })
    ]])
  })
})

telegram.onCallbackQuery(async (query) => {
  await query.answer({})

  if (query.chatId === undefined) {
    return
  }

  // passing receiver_user_id opts into ephemeral — callback_query_id auto-fills from the query,
  // so only the presser sees this. omit receiver_user_id and the same send is public
  await query.send(query.chatId, 'psst — only you can see this tip', { receiver_user_id: query.userId })
})

await telegram.startPolling()
