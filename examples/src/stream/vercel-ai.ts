// runtime requires `ai` + a provider package (e.g. `@ai-sdk/openai`) installed
// structural-typed locally so the example typechecks without the sdk installed
import { stream } from '@puregram/stream'
import { Telegram } from 'puregram'

interface VercelAIResult {
  textStream: AsyncIterable<string>
}

// the vercel ai sdk's `streamText` returns `{ textStream }` — `stream` auto-detects the shape
// and drains the `textStream` for you
declare function streamText (params: { model: unknown, prompt: string }): VercelAIResult
declare const model: unknown

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(stream())

telegram.onMessage(async (message) => {
  if (!message.hasText() || !message.text.startsWith('/ask ')) {
    return
  }

  const result = streamText({
    model,
    prompt: message.text.slice(5)
  })

  await message.stream(result)
})

await telegram.startPolling()
