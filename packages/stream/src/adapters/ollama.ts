/** structural shape of an ollama chat streaming chunk */
interface OllamaChunkLike {
  message?: { content?: string | undefined } | undefined
}

/** adapter for `ollama.chat({ ..., stream: true })` — yields the assistant message content deltas */
export async function * fromOllama (source: AsyncIterable<OllamaChunkLike>): AsyncIterable<string> {
  for await (const chunk of source) {
    const text = chunk.message?.content

    if (typeof text === 'string' && text.length > 0) {
      yield text
    }
  }
}
