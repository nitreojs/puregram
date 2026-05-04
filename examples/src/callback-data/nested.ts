import { defineCallbackData } from '@puregram/callback-data'
import { Telegram, InlineKeyboard } from 'puregram'

// every field has options — `optional`, `default`, or strict
// `optional: true` makes the field absent at unpack; `default` substitutes when omitted at pack
const Page = defineCallbackData('page')
  .number('userId')
  .number('page', { default: 1 })
  .literal('sort', ['new', 'top'] as const)
  .boolean('mine', { default: false })

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  return message.send('paginate', {
    reply_markup: InlineKeyboard.keyboard([[
      // `page` is omitted — packs as the default (1)
      Page.button({ text: 'page 1', userId: 42, sort: 'new' }),
      Page.button({ text: 'page 2', userId: 42, sort: 'new', page: 2 }),
      Page.button({ text: 'mine', userId: 42, sort: 'top', mine: true })
    ]])
  })
})

telegram.onCallbackQuery(Page.filter, (query) => {
  // payload: { userId: number, page: number, sort: 'new' | 'top', mine: boolean }
  const { userId, page, sort, mine } = query.payload

  return query.answer({ text: `${userId} | page ${page} | ${sort}${mine ? ' (mine)' : ''}` })
})

await telegram.startPolling()
