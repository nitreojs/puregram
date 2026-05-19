/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { runStream, type StreamApi } from '../src/core'

function makeMockApi () {
  const drafts: Record<string, unknown>[] = []
  const messages: Record<string, unknown>[] = []
  const api: StreamApi = {
    sendMessageDraft: vi.fn(async (params: Record<string, unknown>) => {
      drafts.push(params)

      return true
    }),
    sendMessage: vi.fn(async (params: Record<string, unknown>) => {
      messages.push(params)

      return {
        message_id: messages.length,
        date: 0,
        chat: { id: params.chat_id, type: 'private' as const }
      } as never
    })
  }

  return { api, drafts, messages }
}

async function * fromArray (items: readonly string[], delays?: readonly number[]) {
  for (let i = 0; i < items.length; i += 1) {
    if (delays && delays[i]) {
      await new Promise(resolve => setTimeout(resolve, delays[i]))
    }

    yield items[i]!
  }
}

describe('runStream — core state machine', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('coalesces drafts under a soft edit floor and finalizes with sendMessage', async () => {
    const { api, drafts, messages } = makeMockApi()

    const result = await runStream(api, {
      chatId: 1,
      source: fromArray(['hello', ' ', 'world']),
      draftIdOffset: 100,
      editIntervalMs: 5,
      thinkingPlaceholder: false
    })

    expect(messages).toHaveLength(1)
    expect(messages[0]!.text).toBe('hello world')
    expect(messages[0]!.chat_id).toBe(1)
    expect(drafts.length).toBeGreaterThanOrEqual(1)
    expect(result.pieces).toBe(3)
    expect(result.bytes).toBe('hello world'.length)
    expect(result.messages).toHaveLength(1)
    expect(result.aborted).toBe(false)
  })

  it('emits a thinking placeholder when enabled', async () => {
    const { api, drafts } = makeMockApi()

    await runStream(api, {
      chatId: 1,
      source: fromArray(['a']),
      draftIdOffset: 10,
      editIntervalMs: 0,
      thinkingPlaceholder: true
    })

    expect(drafts[0]).toMatchObject({ text: '', draft_id: 10 })
  })

  it('rolls over to a fresh draft after 4096 chars and finalizes each window separately', async () => {
    const { api, messages } = makeMockApi()

    const big = 'a'.repeat(4096)
    const tail = 'b'.repeat(100)

    await runStream(api, {
      chatId: 1,
      source: fromArray([big, tail]),
      draftIdOffset: 0,
      editIntervalMs: 0,
      thinkingPlaceholder: false
    })

    expect(messages).toHaveLength(2)
    expect((messages[0]!.text as string).length).toBe(4096)
    expect(messages[1]!.text).toBe(tail)
  })

  it('honors an AbortSignal and reports aborted=true', async () => {
    const { api } = makeMockApi()

    const controller = new AbortController()

    let counter = 0

    async function * source () {
      while (true) {
        if (controller.signal.aborted) {
          return
        }

        counter += 1

        if (counter === 3) {
          controller.abort()
        }

        yield 'x'

        await new Promise(resolve => setTimeout(resolve, 1))
      }
    }

    const result = await runStream(api, {
      chatId: 1,
      source: source(),
      draftIdOffset: 0,
      editIntervalMs: 0,
      thinkingPlaceholder: false,
      signal: controller.signal
    })

    expect(result.aborted).toBe(true)
  })

  it('propagates source errors via onError + rethrow after finalizing', async () => {
    const { api, messages } = makeMockApi()

    const boom = new Error('boom')

    async function * source () {
      yield 'partial'
      throw boom
    }

    const onError = vi.fn()

    await expect(runStream(api, {
      chatId: 1,
      source: source(),
      draftIdOffset: 0,
      editIntervalMs: 0,
      thinkingPlaceholder: false,
      onError
    })).rejects.toBe(boom)

    expect(onError).toHaveBeenCalledWith(boom)
    expect(messages).toHaveLength(1)
    expect(messages[0]!.text).toBe('partial')
  })

  it('invokes onPiece on every source yield with the draft id', async () => {
    const { api } = makeMockApi()

    const onPiece = vi.fn()

    await runStream(api, {
      chatId: 1,
      source: fromArray(['a', 'b']),
      draftIdOffset: 42,
      editIntervalMs: 0,
      thinkingPlaceholder: false,
      onPiece
    })

    expect(onPiece).toHaveBeenCalledTimes(2)
    expect(onPiece.mock.calls[0]![0]).toEqual({ text: 'a' })
    expect(onPiece.mock.calls[0]![1]).toBe(42)
  })

  it('invokes onDraftFinalized for each sendMessage', async () => {
    const { api } = makeMockApi()

    const onDraftFinalized = vi.fn()

    await runStream(api, {
      chatId: 1,
      source: fromArray(['a'.repeat(4096), 'tail']),
      draftIdOffset: 0,
      editIntervalMs: 0,
      thinkingPlaceholder: false,
      onDraftFinalized
    })

    expect(onDraftFinalized).toHaveBeenCalledTimes(2)
  })

  it('forwards reply_markup only to the terminal sendMessage', async () => {
    const { api, drafts, messages } = makeMockApi()

    await runStream(api, {
      chatId: 1,
      source: fromArray(['hi']),
      draftIdOffset: 7,
      editIntervalMs: 0,
      thinkingPlaceholder: false,
      reply_markup: { inline_keyboard: [] }
    })

    for (const draft of drafts) {
      expect(draft.reply_markup).toBeUndefined()
    }

    expect(messages[0]!.reply_markup).toEqual({ inline_keyboard: [] })
  })
})
