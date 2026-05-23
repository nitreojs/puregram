import { InlineKeyboard, InlineQueryResult, InputMessageContent, Telegram } from 'puregram'

import { PAGE_SIZE, searchProducts, type Product } from './catalog'

const telegram = Telegram.fromToken(process.env.TOKEN!)

function detailsKeyboard (product: Product) {
  return InlineKeyboard.keyboard([
    [InlineKeyboard.urlButton({ text: 'open store', url: 'https://example.com/' + product.id })]
  ])
}

function renderResult (product: Product) {
  return InlineQueryResult.article({
    id: product.id,
    title: `${product.title} — ${product.price}`,
    description: product.description,
    content: InputMessageContent.text(
      `🛒 <b>${product.title}</b> — ${product.price}\n${product.description}`,
      { parseMode: 'HTML' }
    ),
    replyMarkup: detailsKeyboard(product)
  })
}

telegram.onInlineQuery(async (update) => {
  // telegram's `offset` is a free-form continuation string the bot defines;
  // we use it as a numeric page index (empty / unparseable → page 0)
  const page = Number.parseInt(update.offset, 10) || 0
  const { slice, hasMore, total } = searchProducts(update.query, page)

  await update.answer({
    cache_time: 0,
    is_personal: true,
    results: slice.map(renderResult),
    // telling telegram where to continue when the user scrolls past these results
    next_offset: hasMore ? String(page + 1) : '',
    // friendly banner that opens a private chat with the bot if no results match
    ...(total === 0 && {
      button: InlineQueryResult.button('no matches — open the bot to help', { startParameter: 'help' })
    })
  })

  console.log(
    `[inline] query=${JSON.stringify(update.query)} page=${page} → ${slice.length} of ${total}`
    + (hasMore ? ` (more on page ${page + 1})` : '')
  )
})

// optional analytics — telegram fires this when a user picks one of our results.
// useful for popularity tracking, recommendations, or just observability
telegram.onChosenInlineResult((update) => {
  console.log(`[chosen] result=${update.raw.result_id} query=${JSON.stringify(update.raw.query)}`)
})

telegram.onMessage(async (message) => {
  if (message.text === '/start' || message.text === '/help') {
    await message.send(
      'inline-search demo bot\n\n'
      + '1. open any chat\n'
      + '2. type @' + (telegram.bot.username ?? 'this_bot') + ' <query>\n'
      + '3. scroll for more — pagination uses telegram\'s next_offset\n\n'
      + `dataset: ${searchProducts('', 0).total} mock products (showing ${PAGE_SIZE} per page)`
    )
  }
})

await telegram.startPolling()

console.log(`[inline-search-bot] logged in as @${telegram.bot.username ?? '<unknown>'}`)
