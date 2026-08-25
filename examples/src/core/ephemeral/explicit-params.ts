import { InlineKeyboard, Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage(async (message) => {
  if (!message.hasText() || !/^\/menu/.test(message.text)) {
    return
  }

  await telegram.api.sendMessage({
    chat_id: message.chatId,
    text: 'a menu only you can see',
    ephemeral_message_parameters: { receiver_user_id: message.senderId },
    reply_markup: InlineKeyboard.keyboard([[
      InlineKeyboard.textButton({ text: 'more', payload: 'more' })
    ]])
  })
})

telegram.onCallbackQuery(async (query) => {
  if (query.chatId === undefined || query.data !== 'more') {
    return
  }

  await query.answer({})

  const eph = telegram.ephemeral(query.userId, { callbackQueryId: query.id })

  await eph.sendMessage({ chat_id: query.chatId, text: 'still only you' })
  await eph.sendPhoto({ chat_id: query.chatId, photo: 'https://picsum.photos/300/200' })
})

await telegram.startPolling()
