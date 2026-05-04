import { Telegram, MarkdownV2 } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  // markdown-v2 has aggressive escaping rules — `MarkdownV2.escape(...)` handles the special chars
  // every helper auto-escapes its content; raw strings you splice in must use `escape`
  const text = [
    MarkdownV2.bold('important'),
    MarkdownV2.italic('and italic'),
    MarkdownV2.blockquote('blockquote\nmulti-line'),
    MarkdownV2.escape('1.0 + 2.0 = 3.0!')
  ].join('\n\n')

  return message.send(text, { parse_mode: MarkdownV2.parseMode })
})

await telegram.startPolling()
