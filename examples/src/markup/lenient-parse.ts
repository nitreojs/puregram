import { html, markup, md } from '@puregram/markup'
import { Telegram } from 'puregram'

// llm output is rarely valid markdown/html — `md.lenient` / `html.lenient` swallow parse errors
// and fall back to plain text instead of throwing, so a malformed model reply never crashes a send
const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(markup())

declare function callLlm (prompt: string): Promise<string>

telegram.onMessage(async (message) => {
  if (!message.hasText()) {
    return
  }

  const reply = await callLlm(message.text)

  // strict `md(reply)` would throw on stray `_` or unmatched `*` — lenient downgrades to text
  await message.send(md.lenient(reply))

  const htmlReply = await callLlm(message.text)

  await message.send(html.lenient(htmlReply))
})

await telegram.startPolling()
