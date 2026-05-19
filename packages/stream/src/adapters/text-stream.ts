/** adapter for a web `ReadableStream<string>` — drains it via a reader and yields the chunks */
export async function * fromTextStream (stream: ReadableStream<string>): AsyncIterable<string> {
  const reader = stream.getReader()

  try {
    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        return
      }

      if (typeof value === 'string' && value.length > 0) {
        yield value
      }
    }
  } finally {
    reader.releaseLock()
  }
}
