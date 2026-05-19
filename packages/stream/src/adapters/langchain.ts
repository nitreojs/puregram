/** langchain's stream emits either bare strings or `BaseMessageChunk`-shaped objects exposing `content` */
type LangChainChunk = string | { content?: unknown }

function extractText (chunk: LangChainChunk) {
  if (typeof chunk === 'string') {
    return chunk
  }

  const content = chunk.content

  if (typeof content === 'string') {
    return content
  }

  // langchain multimodal chunks expose content as `Array<{ type: 'text', text: string } | ...>`
  if (Array.isArray(content)) {
    let acc = ''

    for (const part of content) {
      if (part && typeof part === 'object' && 'text' in part) {
        const t = (part as { text?: unknown }).text

        if (typeof t === 'string') {
          acc += t
        }
      }
    }

    return acc
  }

  return ''
}

/** adapter for `await chain.stream(input)` — handles both string chunks and message-chunk objects */
export async function * fromLangChain (source: AsyncIterable<LangChainChunk>): AsyncIterable<string> {
  for await (const chunk of source) {
    const text = extractText(chunk)

    if (text.length > 0) {
      yield text
    }
  }
}
