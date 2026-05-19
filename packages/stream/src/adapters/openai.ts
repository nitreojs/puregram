/** structural shape of openai chat-completions streaming chunks; matches openai-node without depending on it */
interface OpenAIChunkLike {
  choices?: readonly ({ delta?: { content?: string | null | undefined } | undefined } | undefined)[]
}

/**
 * adapter for openai chat-completions streams. accepts `await openai.chat.completions.create({ stream: true })`
 * directly and yields the textual deltas, skipping tool-call and finish-only chunks
 */
export async function * fromOpenAI (source: AsyncIterable<OpenAIChunkLike>): AsyncIterable<string> {
  for await (const chunk of source) {
    const text = chunk.choices?.[0]?.delta?.content

    if (typeof text === 'string' && text.length > 0) {
      yield text
    }
  }
}
