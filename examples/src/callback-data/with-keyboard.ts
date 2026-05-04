import { defineCallbackData } from '@puregram/callback-data'
import { Telegram, InlineKeyboard } from 'puregram'

// multiple schemas with distinct slugs — each filter only matches its own
const Ban = defineCallbackData('ban').number('userId')
const Mute = defineCallbackData('mute').number('userId')

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  if (!message.hasText()) {
    return
  }

  return message.send('moderate this user:', {
    reply_markup: InlineKeyboard.keyboard([[
      // `senderId` resolves `from.id → sender_chat.id → chat.id` — always a number
      Ban.button({ text: '🔨 ban', userId: message.senderId }),
      Mute.button({ text: '🤫 mute', userId: message.senderId })
    ]])
  })
})

telegram.onCallbackQuery(Ban.filter, (query) => {
  return query.answer({ text: `banned ${query.payload.userId}` })
})

telegram.onCallbackQuery(Mute.filter, (query) => {
  return query.answer({ text: `muted ${query.payload.userId}` })
})

await telegram.startPolling()
