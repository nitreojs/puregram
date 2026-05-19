import { fromAnthropic } from './adapters/anthropic'
import { fromEventEmitter } from './adapters/event-emitter'
import { fromLangChain } from './adapters/langchain'
import { fromOllama } from './adapters/ollama'
import { fromOpenAI } from './adapters/openai'
import { fromTextStream } from './adapters/text-stream'
import { fromVercelAI } from './adapters/vercel-ai'

/** any source shape `tg.stream` accepts. either yields strings or carries an inner `textStream` etc */
export type StreamSource =
  | AsyncIterable<unknown>
  | Iterable<unknown>
  | { textStream: AsyncIterable<string> }
  | ReadableStream<string>
  | { on: (event: string, listener: (...args: unknown[]) => void) => unknown }

function isAsyncIterable (value: unknown): value is AsyncIterable<unknown> {
  return value !== null && typeof value === 'object' && Symbol.asyncIterator in value
}

function isIterable (value: unknown): value is Iterable<unknown> {
  return value !== null && typeof value === 'object' && Symbol.iterator in value
}

function isReadableStream (value: unknown): value is ReadableStream<string> {
  return value !== null && typeof value === 'object' &&
    typeof (value as { getReader?: unknown }).getReader === 'function'
}

function isVercelAIResult (value: unknown): value is { textStream: AsyncIterable<string> } {
  return value !== null && typeof value === 'object' &&
    isAsyncIterable((value as { textStream?: unknown }).textStream)
}

function isEventEmitter (value: unknown): value is { on: (e: string, l: (...args: unknown[]) => void) => unknown } {
  return value !== null && typeof value === 'object' &&
    typeof (value as { on?: unknown }).on === 'function'
}

interface SampleChunk {
  type?: unknown
  delta?: unknown
  choices?: readonly ({ delta?: { content?: unknown } } | undefined)[]
  message?: { content?: unknown }
  text?: unknown
  content?: unknown
}

async function * stringifyIterable (source: AsyncIterable<unknown> | Iterable<unknown>): AsyncIterable<string> {
  for await (const chunk of source as AsyncIterable<unknown>) {
    if (typeof chunk === 'string') {
      if (chunk.length > 0) {
        yield chunk
      }

      continue
    }

    if (chunk && typeof chunk === 'object') {
      const c = chunk as SampleChunk

      // anthropic
      if (typeof c.type === 'string' && c.type === 'content_block_delta') {
        const delta = c.delta as { text?: unknown } | undefined
        const text = delta?.text

        if (typeof text === 'string' && text.length > 0) {
          yield text
        }

        continue
      }

      // openai responses api delta
      if (typeof c.type === 'string' && c.type === 'response.output_text.delta') {
        const delta = c.delta

        if (typeof delta === 'string' && delta.length > 0) {
          yield delta
        }

        continue
      }

      // openai chat completions chunk
      const delta = c.choices?.[0]?.delta?.content

      if (typeof delta === 'string' && delta.length > 0) {
        yield delta; continue
      }

      // ollama
      const ollama = c.message?.content

      if (typeof ollama === 'string' && ollama.length > 0) {
        yield ollama; continue
      }

      // langchain message chunk
      if (typeof c.content === 'string' && c.content.length > 0) {
        yield c.content; continue
      }

      // formatted-like — entities dropped, formatted streaming not yet supported
      if (typeof c.text === 'string' && c.text.length > 0) {
        yield c.text; continue
      }
    }
  }
}

/**
 * normalize any supported source into an `AsyncIterable<string>` of text deltas.
 *
 * recognized shapes (in order):
 *  1. `ReadableStream<string>` — drained via `fromTextStream`
 *  2. vercel ai sdk `{ textStream }` — drained via `fromVercelAI`
 *  3. `AsyncIterable` / `Iterable` — duck-typed per-chunk for openai/anthropic/ollama/langchain/string
 *  4. node-style `EventEmitter` with `.on('text', ...)` — drained via `fromEventEmitter`
 */
export function normalize (source: StreamSource) {
  if (isReadableStream(source)) {
    return fromTextStream(source)
  }

  if (isVercelAIResult(source)) {
    return fromVercelAI(source)
  }

  if (isAsyncIterable(source) || isIterable(source)) {
    return stringifyIterable(source)
  }

  if (isEventEmitter(source)) {
    return fromEventEmitter(source)
  }

  throw new TypeError('[@puregram/stream] unsupported source: not AsyncIterable, ReadableStream, vercel-ai result, or EventEmitter')
}

export { fromOpenAI, fromAnthropic, fromOllama, fromLangChain }
