/* eslint-disable @typescript-eslint/require-await */
import { describe, expect, it, vi } from 'vitest'

import { runStream, type StreamApi, type StreamStopController } from '../src/core'
import { stream } from '../src/plugin'

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

function controllerFor (chatId: number): StreamStopController {
  return { chatId, draftIds: new Set(), stopped: false }
}

async function * stopAfterFirstDraft (stop: StreamStopController, items: readonly string[]) {
  for (const item of items) {
    yield item

    if (stop.draftIds.size > 0) {
      stop.stopped = true
      stop.onStop?.()
    }
  }
}

describe('runStream — stop button', () => {
  it('forwards can_stop and keep_on_stop to every draft', async () => {
    const { api, drafts } = makeMockApi()

    const result = await runStream(api, {
      chatId: 1,
      source: (async function * () { yield 'hi' })(),
      canStop: true,
      keepOnStop: true,
      editIntervalMs: 0,
      draftIdOffset: 0
    })

    expect(drafts.length).toBeGreaterThan(0)

    for (const draft of drafts) {
      expect(draft.can_stop).toBe(true)
      expect(draft.keep_on_stop).toBe(true)
    }

    expect(result.stopped).toBe(false)
  })

  it('omits both fields when the options are absent', async () => {
    const { api, drafts } = makeMockApi()

    await runStream(api, {
      chatId: 1,
      source: (async function * () { yield 'hi' })(),
      editIntervalMs: 0,
      draftIdOffset: 0
    })

    expect(drafts[0]).not.toHaveProperty('can_stop')
    expect(drafts[0]).not.toHaveProperty('keep_on_stop')
  })

  it('persists the partial answer on stop when keepOnStop is set', async () => {
    const { api, messages } = makeMockApi()
    const stop = controllerFor(1)

    const result = await runStream(api, {
      chatId: 1,
      source: stopAfterFirstDraft(stop, ['partial answer', ' never streamed']),
      canStop: true,
      keepOnStop: true,
      stop,
      editIntervalMs: 0,
      draftIdOffset: 0
    })

    expect(result.stopped).toBe(true)
    expect(messages).toHaveLength(1)
    expect(messages[0]!.text).toBe('partial answer')
  })

  it('discards the partial answer on stop without keepOnStop', async () => {
    const { api, messages } = makeMockApi()
    const stop = controllerFor(1)

    const result = await runStream(api, {
      chatId: 1,
      source: stopAfterFirstDraft(stop, ['partial answer', ' never streamed']),
      canStop: true,
      stop,
      editIntervalMs: 0,
      draftIdOffset: 0
    })

    expect(result.stopped).toBe(true)
    expect(messages).toHaveLength(0)
  })

  it('keeps slots that already rolled over when keepOnStop is set', async () => {
    const { api, messages } = makeMockApi()
    const stop = controllerFor(1)

    const result = await runStream(api, {
      chatId: 1,
      source: stopAfterFirstDraft(stop, ['x'.repeat(5000)]),
      canStop: true,
      keepOnStop: true,
      stop,
      editIntervalMs: 0,
      draftIdOffset: 0
    })

    expect(result.stopped).toBe(true)
    expect(messages.map(m => (m.text as string).length)).toEqual([4096, 904])
  })

  it('drops rolled-over slots on a stop without keepOnStop', async () => {
    const { api, messages } = makeMockApi()
    const stop = controllerFor(1)

    const result = await runStream(api, {
      chatId: 1,
      source: stopAfterFirstDraft(stop, ['x'.repeat(5000)]),
      canStop: true,
      stop,
      editIntervalMs: 0,
      draftIdOffset: 0
    })

    expect(result.stopped).toBe(true)
    expect(messages).toHaveLength(0)
  })

  it('registers every draft id it puts on the wire', async () => {
    const { api } = makeMockApi()
    const stop = controllerFor(1)

    await runStream(api, {
      chatId: 1,
      source: (async function * () { yield 'hi' })(),
      canStop: true,
      stop,
      editIntervalMs: 0,
      draftIdOffset: 7
    })

    expect([...stop.draftIds]).toContain(8)
  })
})

type StopMiddleware = (update: unknown, next: () => Promise<void>) => Promise<void>

function makeFakeTg () {
  const hooks: StopMiddleware[] = []
  const firstDraft = Promise.withResolvers<void>()
  const sendMessage = vi.fn((params: Record<string, unknown>) => Promise.resolve({
    message_id: 1, date: 0, chat: { id: params.chat_id, type: 'private' as const }
  }))
  const sendMessageDraft = vi.fn(() => {
    firstDraft.resolve()

    return Promise.resolve(true)
  })
  const useHook = vi.fn((_name: string, middleware: StopMiddleware) => {
    hooks.push(middleware)
  })

  return {
    tg: { api: { sendMessage, sendMessageDraft }, useHook, onStoppedMessageGeneration: vi.fn() },
    hooks,
    firstDraft,
    sendMessage,
    sendMessageDraft
  }
}

class FakeStopUpdate {
  readonly kind = 'stopped_message_generation' as const

  constructor (readonly chat: { id: number }, readonly draftId: number) {}
}

const noop = () => Promise.resolve()

describe('stream plugin — stop watcher', () => {
  it('registers an onUpdate middleware that always calls next', async () => {
    const { tg, hooks } = makeFakeTg()

    await stream().install(tg as never)

    expect(hooks).toHaveLength(1)

    const next = vi.fn(() => Promise.resolve())

    await hooks[0]!(new FakeStopUpdate({ id: 1 }, 5), next)
    await hooks[0]!({ kind: 'message' }, next)

    expect(next).toHaveBeenCalledTimes(2)
  })

  it('stops the run whose chat and draft id match', async () => {
    const { tg, hooks, firstDraft, sendMessage } = makeFakeTg()
    const ext = await stream().install(tg as never)
    const gate = Promise.withResolvers<void>()

    const source = (async function * () {
      yield 'partial'

      await gate.promise

      yield ' tail'
    })()

    const run = ext.stream({
      chat_id: 1,
      source,
      canStop: true,
      keepOnStop: true,
      thinkingPlaceholder: false,
      editIntervalMs: 0,
      draftIdOffset: 42
    })

    await firstDraft.promise

    await hooks[0]!(new FakeStopUpdate({ id: 1 }, 999), noop)
    await hooks[0]!(new FakeStopUpdate({ id: 2 }, 43), noop)

    expect(sendMessage).not.toHaveBeenCalled()

    await hooks[0]!(new FakeStopUpdate({ id: 1 }, 43), noop)
    gate.resolve()

    const result = await run
    const sent = sendMessage.mock.calls[0]![0] as { text: string }

    expect(result.stopped).toBe(true)
    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(sent.text).toBe('partial')
  })

  it('leaves runs alone when canStop is not requested', async () => {
    const { tg, hooks } = makeFakeTg()
    const ext = await stream().install(tg as never)

    const result = await ext.stream({
      chat_id: 1,
      source: ['plain'],
      thinkingPlaceholder: false,
      editIntervalMs: 0,
      draftIdOffset: 42
    })

    await hooks[0]!(new FakeStopUpdate({ id: 1 }, 43), noop)

    expect(result.stopped).toBe(false)
  })
})
