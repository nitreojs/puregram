/* eslint-disable @typescript-eslint/require-await */
import { describe, expect, it, vi } from 'vitest'

import { stream } from '../src/plugin'

function makeFakeTg () {
  const sendMessage = vi.fn((params: Record<string, unknown>) => Promise.resolve({
    message_id: 1, date: 0, chat: { id: params.chat_id, type: 'private' as const }
  }))
  const sendMessageDraft = vi.fn(() => Promise.resolve(true))

  return {
    tg: {
      api: { sendMessage, sendMessageDraft },
      useHook: vi.fn(),
      onStoppedMessageGeneration: vi.fn()
    },
    sendMessage
  }
}

// parks inside its own await, so next() never settles and the pump cannot reach a break
function stalledSource () {
  return (async function * () {
    yield 'partial'

    await new Promise<void>(() => {})
  })()
}

const settleOr = async <T>(promise: Promise<T>, ms: number) => await Promise.race([
  promise.then(value => ({ settled: true as const, value })),
  new Promise<{ settled: false }>(resolve => setTimeout(() => resolve({ settled: false }), ms))
])

describe('stream — cancelling a run whose source has stalled', () => {
  it('settles on abort and drops the run from active', async () => {
    const { tg } = makeFakeTg()
    const ext = await stream().install(tg as never)
    const controller = new AbortController()

    const run = ext({
      chat_id: 1,
      source: stalledSource(),
      thinkingPlaceholder: false,
      editIntervalMs: 0,
      signal: controller.signal
    })

    // aborting before the pump parks exits via the ordinary chunk path and tests nothing
    await vi.waitUntil(() => ext.active[0]?.drafts !== undefined && ext.active[0].drafts > 0)
    await new Promise<void>(resolve => setTimeout(resolve, 50))

    controller.abort()

    const outcome = await settleOr(run, 1000)

    expect(outcome.settled).toBe(true)
    expect(outcome.settled && outcome.value.aborted).toBe(true)
    expect(ext.active).toEqual([])
  })

  it('settles on a bot-side stop and drops the run from active', async () => {
    const { tg } = makeFakeTg()
    const ext = await stream().install(tg as never)

    const run = ext({
      chat_id: 7,
      source: stalledSource(),
      keepOnStop: true,
      thinkingPlaceholder: false,
      editIntervalMs: 0
    })

    await vi.waitUntil(() => ext.active[0]?.drafts !== undefined && ext.active[0].drafts > 0)
    await new Promise<void>(resolve => setTimeout(resolve, 50))

    expect(ext.stop(7)).toBe(1)

    const outcome = await settleOr(run, 1000)

    expect(outcome.settled).toBe(true)
    expect(outcome.settled && outcome.value.stopped).toBe(true)
    expect(ext.active).toEqual([])
  })

  it('leaves no abort listener behind on a shared signal', async () => {
    const { tg } = makeFakeTg()
    const ext = await stream().install(tg as never)
    const controller = new AbortController()
    const { signal } = controller

    const added: string[] = []
    const removed: string[] = []
    const realAdd = signal.addEventListener.bind(signal)
    const realRemove = signal.removeEventListener.bind(signal)

    signal.addEventListener = ((type: string, ...rest: unknown[]) => {
      added.push(type)

      return (realAdd as (...args: unknown[]) => void)(type, ...rest)
    }) as typeof signal.addEventListener

    signal.removeEventListener = ((type: string, ...rest: unknown[]) => {
      removed.push(type)

      return (realRemove as (...args: unknown[]) => void)(type, ...rest)
    }) as typeof signal.removeEventListener

    for (let i = 0; i < 3; i++) {
      await ext({
        chat_id: 1,
        source: ['done'],
        thinkingPlaceholder: false,
        editIntervalMs: 0,
        signal
      })
    }

    expect(added.filter(t => t === 'abort')).toHaveLength(3)
    expect(removed.filter(t => t === 'abort')).toHaveLength(3)
  })
})
