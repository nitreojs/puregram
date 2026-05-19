// runtime requires `openai` installed — structural-typed locally so the example typechecks without it
import { stream } from '@puregram/stream'
import { Telegram } from 'puregram'

// minimal structural slice of `OpenAI` — the real SDK satisfies this shape at runtime
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

  // `normalize` duck-types each chunk for `choices[0].delta.content` and yields textual deltas
  await message.stream(completion)
})

await telegram.startPolling()
