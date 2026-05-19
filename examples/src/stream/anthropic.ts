// runtime requires `@anthropic-ai/sdk` installed — structural-typed locally to typecheck without it
import { stream } from '@puregram/stream'
import { Telegram } from 'puregram'

interface AnthropicStreamEvent {
  type: string
  delta?: { type?: string, text?: string }
}

interface AnthropicMessageStream {
  iter: () => AsyncIterable<AnthropicStreamEvent>
}

interface AnthropicClient {
  messages: {
    stream: (params: {
      model: string
      max_tokens: number
      messages: { role: string, content: string }[]
    }) => AnthropicMessageStream
  }
}

declare const anthropic: AnthropicClient

// pass the result of `anthropic.messages.stream(...).iter()` directly — `stream` auto-detects
// `content_block_delta` events and emits their text payload
const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(stream())

telegram.onMessage(async (message) => {
  if (!message.hasText() || !message.text.startsWith('/ask ')) {
    return
  }

  const anthropicStream = anthropic.messages.stream({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message.text.slice(5) }]
  })

  await message.stream(anthropicStream.iter())
})

await telegram.startPolling()
