import { describe, it, expect, vi } from 'vitest'

import { Telegram } from '../../src/telegram'

// trigger reportDispatchError without a real polling/webhook loop by throwing
// from a raw-update handler — the runRawUpdateHandlers path funnels the error
// through reportDispatchError just like polling does
function dispatchRaw (tg: Telegram, raw: Record<string, unknown>) {
  return (tg as unknown as { handleIncoming: (r: Record<string, unknown>) => Promise<void> })
    .handleIncoming(raw)
}

const messageUpdate = (text: string) => ({
  update_id: 1,
  message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text }
})

describe('tg.catch + swallowDispatchErrors', () => {
  it('catch handler receives errors thrown by raw-update handlers', async () => {
    const tg = new Telegram({ token: 'X', swallowDispatchErrors: true })
    const seen: Error[] = []

    tg.catch((err) => {
      seen.push(err)
    })

    tg.onRawUpdate(() => {
      throw new Error('boom')
    })

    await dispatchRaw(tg, messageUpdate('hi'))
    await new Promise(resolve => setImmediate(resolve))

    expect(seen).toHaveLength(1)
    expect(seen[0]?.message).toBe('boom')
  })

  it('swallowDispatchErrors: true suppresses uncaughtException fallback', async () => {
    const tg = new Telegram({ token: 'X', swallowDispatchErrors: true })

    tg.onRawUpdate(() => {
      throw new Error('silent')
    })

    const onUncaught = vi.fn()

    process.on('uncaughtException', onUncaught)

    try {
      await dispatchRaw(tg, messageUpdate('hi'))
      await new Promise(resolve => setImmediate(resolve))
      await new Promise(resolve => setImmediate(resolve))

      expect(onUncaught).not.toHaveBeenCalled()
    } finally {
      process.off('uncaughtException', onUncaught)
    }
  })

  it('swallowDispatchErrors: false rethrows on microtask when no catch is registered', async () => {
    const tg = new Telegram({ token: 'X' })

    tg.onRawUpdate(() => {
      throw new Error('loud')
    })

    const captured: Error[] = []
    const listener = (err: Error) => {
      captured.push(err)
    }

    // detach default listeners so vitest's harness doesn't fail the run
    const previous = process.listeners('uncaughtException')

    for (const handler of previous) {
      process.off('uncaughtException', handler)
    }

    process.on('uncaughtException', listener)

    try {
      await dispatchRaw(tg, messageUpdate('hi'))
      await new Promise(resolve => setImmediate(resolve))
      await new Promise(resolve => setImmediate(resolve))

      expect(captured.some(error => error.message === 'loud')).toBe(true)
    } finally {
      process.off('uncaughtException', listener)

      for (const handler of previous) {
        process.on('uncaughtException', handler as never)
      }
    }
  })

  it('catch handler still fires when swallowDispatchErrors is false', async () => {
    const tg = new Telegram({ token: 'X' })
    const seen: Error[] = []

    tg.catch((err) => {
      seen.push(err)
    })

    tg.onRawUpdate(() => {
      throw new Error('observed')
    })

    await dispatchRaw(tg, messageUpdate('hi'))
    await new Promise(resolve => setImmediate(resolve))

    expect(seen).toHaveLength(1)
    expect(seen[0]?.message).toBe('observed')
  })
})
