import { StringDecoder } from 'node:string_decoder'

/** adapter for an `AsyncIterable<Uint8Array>` — decodes to strings, defaults to utf-8 */
export async function * fromBytes (
  source: AsyncIterable<Uint8Array>,
  encoding: BufferEncoding = 'utf-8'
): AsyncIterable<string> {
  const decoder = new StringDecoder(encoding)

  for await (const chunk of source) {
    const text = decoder.write(Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength))

    if (text.length > 0) {
      yield text
    }
  }

  const tail = decoder.end()

  if (tail.length > 0) {
    yield tail
  }
}
