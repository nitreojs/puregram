/** structural shape of a vercel ai sdk `streamText` result */
interface VercelAILike {
  textStream: AsyncIterable<string>
}

/** adapter for the vercel ai sdk's `streamText({...})` return value — surfaces its `textStream` */
export async function * fromVercelAI (result: VercelAILike): AsyncIterable<string> {
  for await (const chunk of result.textStream) {
    if (chunk.length > 0) {
      yield chunk
    }
  }
}
