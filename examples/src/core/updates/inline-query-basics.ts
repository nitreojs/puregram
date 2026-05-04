import { Telegram, InlineQueryResult, InputMessageContent } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

// inline queries arrive when the user types `@your_bot <query>` in any chat
// you respond with a list of result articles — rendered as a popup above the chat input
telegram.onInlineQuery((inlineQuery) => {
  return inlineQuery.answer({
    results: [
      InlineQueryResult.article({
        id: '1',
        title: 'echo',
        // `content` maps to `input_message_content` in the bot api wire format
        content: InputMessageContent.text(`you searched for: ${inlineQuery.query}`)
      })
    ],
    cache_time: 0
  })
})

await telegram.startPolling()
