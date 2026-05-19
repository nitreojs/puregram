import { stream } from '@puregram/stream'
import { Telegram } from 'puregram'

// `parseMode: 'MarkdownV2'` formats interim edits as markdown; `signal` aborts the whole pipe
// (typing indicator stops, the half-streamed draft is finalized as-is)
const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(stream())

async function * markdownTokens (): AsyncIterable<string> {
  for (const piece of ['# heading\n', 'plain text with ', '**bold** and ', '_italic_ ', 'words.']) {
    await new Promise(resolve => setTimeout(resolve, 200))

    yield piece
  }
}

telegram.onMessage(async (message) => {
  if (!message.hasText() || message.text !== '/md') {
    return
  }

  await message.stream(markdownTokens(), {
    parseMode: 'MarkdownV2',
    signal: AbortSignal.timeout(30_000)
  })
})

await telegram.startPolling()
