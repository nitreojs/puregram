/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/brace-style */
import { EventEmitter } from 'node:events'

import { describe, expect, it } from 'vitest'

import { normalize } from '../src/normalize'

async function collect (source: AsyncIterable<string>) {
  const out: string[] = []

  for await (const chunk of source) {
    out.push(chunk)
  }

  return out
}

describe('normalize — duck-typing detection', () => {
  it('detects plain AsyncIterable<string>', async () => {
    async function * src () { yield 'a'; yield 'b' }

    expect(await collect(normalize(src()))).toEqual(['a', 'b'])
  })

  it('detects openai chat completions chunks', async () => {
    async function * src () {
      yield { choices: [{ delta: { content: 'hi' } }] }
      yield { choices: [{ delta: { content: ' there' } }] }
      yield { choices: [{ delta: {} }] }
    }

    expect(await collect(normalize(src()))).toEqual(['hi', ' there'])
  })

  it('detects anthropic content_block_delta events', async () => {
    async function * src () {
      yield { type: 'message_start' }
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'foo' } }
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'bar' } }
    }

    expect(await collect(normalize(src()))).toEqual(['foo', 'bar'])
  })

  it('detects openai responses-api deltas', async () => {
    async function * src () {
      yield { type: 'response.output_text.delta', delta: 'partial' }
      yield { type: 'response.completed' }
    }

    expect(await collect(normalize(src()))).toEqual(['partial'])
  })

  it('detects ollama message.content', async () => {
    async function * src () {
      yield { message: { content: 'hello' } }
      yield { message: { content: ' world' } }
    }

    expect(await collect(normalize(src()))).toEqual(['hello', ' world'])
  })

  it('detects langchain string-or-content chunks', async () => {
    async function * src () {
      yield 'a'
      yield { content: 'b' }
    }

    expect(await collect(normalize(src()))).toEqual(['a', 'b'])
  })

  it('detects vercel ai sdk result.textStream', async () => {
    async function * inner () { yield 'x'; yield 'y' }

    expect(await collect(normalize({ textStream: inner() }))).toEqual(['x', 'y'])
  })

  it('detects web ReadableStream<string>', async () => {
    const stream = new ReadableStream<string>({
      start (controller) {
        controller.enqueue('a')
        controller.enqueue('b')
        controller.close()
      }
    })

    expect(await collect(normalize(stream))).toEqual(['a', 'b'])
  })

  it('detects node EventEmitter', async () => {
    const ee = new EventEmitter()

    const promise = collect(normalize(ee))

    setTimeout(() => {
      ee.emit('text', 'one')
      ee.emit('text', 'two')
      ee.emit('end')
    }, 1)

    expect(await promise).toEqual(['one', 'two'])
  })

  it('throws on unsupported source', () => {
    expect(() => normalize(42 as never)).toThrow(/unsupported source/)
  })
})
