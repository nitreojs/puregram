import { defineCallbackData } from '@puregram/callback-data'
import { Telegram, InlineKeyboard } from 'puregram'

// schema-define the payload once. fields are typed and packed efficiently
const Vote = defineCallbackData('vote').literal('choice', ['yes', 'no'] as const)

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  // `Vote.button(...)` returns an inline button with the packed payload baked in
  return message.send('do you agree?', {
    reply_markup: InlineKeyboard.keyboard([[
      Vote.button({ text: '👍 yes', choice: 'yes' }),
      Vote.button({ text: '👎 no', choice: 'no' })
    ]])
  })
})

// `Vote.filter` matches only callback queries with this schema's prefix
// `query.payload` is unpacked + typed
telegram.onCallbackQuery(Vote.filter, (query) => {
  return query.answer({ text: `you voted: ${query.payload.choice}` })
})

await telegram.startPolling()
