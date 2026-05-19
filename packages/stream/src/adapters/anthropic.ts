/** structural shape of an anthropic raw stream event */
interface AnthropicEventLike {
  type?: string
  delta?: { type?: string, text?: string } | undefined
}

/**
 * adapter for anthropic's raw event stream — pass the iterator returned by `stream.iter()` (or any
 * `AsyncIterable` over events). emits only `content_block_delta` text events
 */
export async function * fromAnthropic (source: AsyncIterable<AnthropicEventLike>): AsyncIterable<string> {
  for await (const event of source) {
    if (event.type === 'content_block_delta' && typeof event.delta?.text === 'string' && event.delta.text.length > 0) {
      yield event.delta.text
    }
  }
}
