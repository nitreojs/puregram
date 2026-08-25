/* eslint-disable @typescript-eslint/require-await */
import { describe, expect, it, vi } from 'vitest'

import { stream } from '../src/plugin'

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
    sendMessage
  }
}

class FakeStopUpdate {
  readonly kind = 'stopped_message_generation' as const

  constructor (readonly chat: { id: number }, readonly draftId: number) {}
}

const noop = () => Promise.resolve()

describe('tg.stream namespace', () => {
  it('is callable — the shape the docs have always described', async () => {
    const { tg, sendMessage } = makeFakeTg()
    const ext = await stream().install(tg as never)

    expect(typeof ext).toBe('function')

    await ext({ chat_id: 1, source: ['hi'], thinkingPlaceholder: false, editIntervalMs: 0 })

    expect((sendMessage.mock.calls[0]![0] as { text: unknown }).text).toBe('hi')
  })

  it('reports no active runs once a run settles', async () => {
    const { tg } = makeFakeTg()
    const ext = await stream().install(tg as never)

    expect(ext.active).toEqual([])

    await ext({ chat_id: 1, source: ['done'], thinkingPlaceholder: false, editIntervalMs: 0 })

    expect(ext.active).toEqual([])
  })

  it('exposes an in-flight run, then drops it when the run ends', async () => {
    const { tg, firstDraft } = makeFakeTg()
    const ext = await stream().install(tg as never)
    const gate = Promise.withResolvers<void>()

    const source = (async function * () {
      yield 'partial'

      await gate.promise
    })()

    const run = ext({
      chat_id: 77,
      source,
      canStop: true,
      thinkingPlaceholder: false,
      editIntervalMs: 0,
      draftIdOffset: 42
    })

    await firstDraft.promise

    expect(ext.active).toHaveLength(1)
    expect(ext.active[0]).toMatchObject({ chatId: 77, canStop: true, stopped: false })
    expect(ext.active[0]!.drafts).toBeGreaterThan(0)

    gate.resolve()
    await run

    expect(ext.active).toEqual([])
  })

  it('stops a live run by chat id and reports how many it stopped', async () => {
    const { tg, firstDraft, sendMessage } = makeFakeTg()
    const ext = await stream().install(tg as never)
    const gate = Promise.withResolvers<void>()

    const source = (async function * () {
      yield 'partial'

      await gate.promise

      yield ' tail'
    })()

    const run = ext({
      chat_id: 5,
      source,
      canStop: true,
      keepOnStop: true,
      thinkingPlaceholder: false,
      editIntervalMs: 0,
      draftIdOffset: 42
    })

    await firstDraft.promise

    expect(ext.stop(999)).toBe(0)
    expect(ext.stop(5)).toBe(1)
    expect(ext.stop(5)).toBe(0)

    gate.resolve()

    const result = await run

    expect(result.stopped).toBe(true)
    expect((sendMessage.mock.calls[0]![0] as { text: string }).text).toBe('partial')
  })

  it('stops a run that never rendered the stop button', async () => {
    const { tg, firstDraft } = makeFakeTg()
    const ext = await stream().install(tg as never)
    const gate = Promise.withResolvers<void>()

    const source = (async function * () {
      yield 'partial'

      await gate.promise

      yield ' tail'
    })()

    const run = ext({
      chat_id: 8,
      source,
      thinkingPlaceholder: false,
      editIntervalMs: 0,
      draftIdOffset: 42
    })

    await firstDraft.promise

    expect(ext.active[0]).toMatchObject({ canStop: false })
    expect(ext.stop(8)).toBe(1)

    gate.resolve()

    expect((await run).stopped).toBe(true)
  })

  it('leaves a non-canStop run alone when telegram reports a stop', async () => {
    const { tg, hooks, firstDraft } = makeFakeTg()
    const ext = await stream().install(tg as never)
    const gate = Promise.withResolvers<void>()

    const source = (async function * () {
      yield 'partial'

      await gate.promise

      yield ' tail'
    })()

    const run = ext({
      chat_id: 3,
      source,
      thinkingPlaceholder: false,
      editIntervalMs: 0,
      draftIdOffset: 42
    })

    await firstDraft.promise

    await hooks[0]!(new FakeStopUpdate({ id: 3 }, 43), noop)
    gate.resolve()

    expect((await run).stopped).toBe(false)
  })

  it('stopAll stops every live run across chats', async () => {
    const { tg } = makeFakeTg()
    const ext = await stream().install(tg as never)
    const gate = Promise.withResolvers<void>()

    const held = (chatId: number) => {
      const source = (async function * () {
        yield `chat ${chatId}`

        await gate.promise
      })()

      return ext({
        chat_id: chatId,
        source,
        canStop: true,
        thinkingPlaceholder: false,
        editIntervalMs: 0
      })
    }

    const runs = [held(1), held(2), held(3)]

    await vi.waitUntil(() => ext.active.length === 3)

    expect(ext.stopAll()).toBe(3)
    expect(ext.active.every(entry => entry.stopped)).toBe(true)

    gate.resolve()

    const results = await Promise.all(runs)

    expect(results.every(result => result.stopped)).toBe(true)
    expect(ext.active).toEqual([])
  })
})
