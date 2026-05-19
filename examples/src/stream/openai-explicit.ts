// runtime requires `openai` installed — structural-typed locally so the example typechecks without it
import { fromOpenAI, stream } from '@puregram/stream'
import { Telegram } from 'puregram'

interface OpenAIClient {
  chat: {
    completions: {
      create: (params: {
        model: string
        stream: true
        messages: { role: string, content: string }[]
      }) => Promise<AsyncIterable<{ choices?: { delta?: { content?: string | null } }[] }>>
    }
  }
}

declare const openai: OpenAIClient

// `fromOpenAI` is the explicit adapter — useful when you want to chain or transform deltas
// before handing them to `stream`. functionally equivalent to passing the completion directly
const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(stream())

telegram.onMessage(async (message) => {
  if (!message.hasText() || !message.text.startsWith('/ask ')) {
    return
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [{ role: 'user', content: message.text.slice(5) }]
  })

  await message.stream(fromOpenAI(completion))
})

await telegram.startPolling()
