/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/brace-style */
import { EventEmitter } from 'node:events'

import { describe, expect, it } from 'vitest'

import {
  fromAnthropic, fromBytes, fromEventEmitter, fromLangChain, fromOllama,
  fromOpenAI, fromTextStream, fromVercelAI
} from '../src/adapters'

async function collect (source: AsyncIterable<string>) {
  const out: string[] = []

  for await (const chunk of source) {
    out.push(chunk)
  }

  return out
}

describe('adapters — named entry points', () => {
  it('fromOpenAI extracts choices[0].delta.content', async () => {
    async function * src () {
      yield { choices: [{ delta: { content: 'a' } }] }
      yield { choices: [{ delta: { content: 'b' } }] }
      yield { choices: [{ delta: {} }] }
    }

    expect(await collect(fromOpenAI(src()))).toEqual(['a', 'b'])
  })

  it('fromAnthropic extracts content_block_delta.delta.text', async () => {
    async function * src () {
      yield { type: 'message_start' }
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'hi' } }
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: '!' } }
    }

    expect(await collect(fromAnthropic(src()))).toEqual(['hi', '!'])
  })

  it('fromVercelAI surfaces .textStream', async () => {
    async function * inner () { yield 'x'; yield 'y' }

    expect(await collect(fromVercelAI({ textStream: inner() }))).toEqual(['x', 'y'])
  })

  it('fromOllama extracts message.content', async () => {
    async function * src () {
      yield { message: { content: 'foo' } }
      yield { message: { content: '' } }
      yield { message: { content: 'bar' } }
    }

    expect(await collect(fromOllama(src()))).toEqual(['foo', 'bar'])
  })

  it('fromLangChain handles strings and content objects and multimodal arrays', async () => {
    async function * src () {
      yield 'a'
      yield { content: 'b' }
      yield { content: [{ type: 'text', text: 'c' }, { type: 'image' }] }
    }

    expect(await collect(fromLangChain(src()))).toEqual(['a', 'b', 'c'])
  })

  it('fromTextStream drains a web ReadableStream', async () => {
    const stream = new ReadableStream<string>({
      start (controller) {
        controller.enqueue('foo')
        controller.enqueue('bar')
        controller.close()
      }
    })

    expect(await collect(fromTextStream(stream))).toEqual(['foo', 'bar'])
  })

  it('fromBytes decodes utf-8 chunks', async () => {
    async function * src () {
      yield new TextEncoder().encode('hello ')
      yield new TextEncoder().encode('world')
    }

    expect(await collect(fromBytes(src()))).toEqual(['hello ', 'world'])
  })

  it('fromEventEmitter drains until end', async () => {
    const ee = new EventEmitter()
    const promise = collect(fromEventEmitter(ee))

    setTimeout(() => {
      ee.emit('text', 'one')
      ee.emit('text', 'two')
      ee.emit('end')
    }, 1)

    expect(await promise).toEqual(['one', 'two'])
  })

  it('fromEventEmitter rejects on error', async () => {
    const ee = new EventEmitter()
    const promise = collect(fromEventEmitter(ee))

    setTimeout(() => {
      ee.emit('text', 'partial')
      ee.emit('error', new Error('boom'))
    }, 1)

    await expect(promise).rejects.toThrow(/boom/)
  })
})
