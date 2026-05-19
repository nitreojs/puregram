import { stream } from '@puregram/stream'
import { Telegram } from 'puregram'

// `update.stream(source)` accepts any `AsyncIterable<string>` — the plugin streams chunks via
// sendMessageDraft and finalizes with sendMessage. private chats only (see plugin docs)
const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(stream())

async function * fakeTokens (): AsyncIterable<string> {
  for (const word of ['hello', ' ', 'streamed', ' ', 'world', '!']) {
    await new Promise(resolve => setTimeout(resolve, 200))

    yield word
  }
}

telegram.onMessage(async (message) => {
  if (!message.hasText() || message.text !== '/stream') {
    return
  }

  // each chunk edits the draft message until the iterator drains, then the draft is finalized
  await message.stream(fakeTokens())
})

await telegram.startPolling()
