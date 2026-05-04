import { Telegram, HTML } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  // HTML helpers escape user-supplied content for you — never concat raw user input into a parse_mode message
  const text = HTML.bold('hello, ') + HTML.italic('world') + HTML.escape(' & friends')

  // `parse_mode: HTML.parseMode` is just the string `'HTML'` — exposed as a constant for clarity
  return message.send(text, { parse_mode: HTML.parseMode })
})

telegram.onCallbackQuery((query) => {
  // additional helpers: url, code, pre, spoiler, mention by user id
  const text = [
    HTML.url('a link', 'https://example.com'),
    HTML.code('inline code'),
    HTML.spoiler('hidden'),
    HTML.mention('mention me', query.from.id)
  ].join('\n')

  return query.answer({ text: text.slice(0, 200) })
})

await telegram.startPolling()
