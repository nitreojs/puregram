import { describe, it, expect, vi } from 'vitest'

import { Telegram } from '../../src/telegram'

/* eslint-disable @typescript-eslint/no-explicit-any */
const stubApi = (tg: Telegram, methods: Record<string, (...args: any[]) => any>) => {
  const stub: Record<string, any> = {}

  for (const [name, fn] of Object.entries(methods)) {
    stub[name] = vi.fn().mockImplementation(fn)
  }

  Object.defineProperty(tg, 'api', { value: stub, configurable: true })
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const makeUpdate = (update_id: number, chatId: number, text = 'x') => ({
  update_id,
  message: { message_id: update_id, date: 0, chat: { id: chatId, type: 'private' }, text }
})

describe('polling concurrency + sequentializeBy', () => {
  it('updates with the same key dispatch serially (FIFO)', async () => {
    const tg = new Telegram({ token: 'X' })

    const updates = [
      makeUpdate(1, 100),
      makeUpdate(2, 100),
      makeUpdate(3, 100),
      makeUpdate(4, 100),
      makeUpdate(5, 100)
    ]

    let calls = 0

    stubApi(tg, {
      getMe: () => ({ id: 0, is_bot: true, first_name: 'bot', username: 'testbot' }),
      getUpdates: () => {
        calls++

        if (calls === 1) {
          return updates
        }

        tg.stopPolling()

        return []
      }
    })

    const trace: string[] = []
    const gates: (() => void)[] = []

    tg.onMessage(async (m) => {
      const id = m.raw.message_id

      trace.push(`start:${id}`)
      await new Promise<void>((resolve) => {
        gates.push(resolve)
      })
      trace.push(`end:${id}`)
    })

    await tg.startPolling({
      sequentializeBy: () => 'same'
    })

    // let the backgrounded loop pull the batch and spin up the first dispatch
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    // only the first dispatch should have started; all others wait on its completion
    expect(trace).toEqual(['start:1'])

    // release all gates in order, awaiting between each so the next entry can run
    for (let i = 0; i < updates.length; i++) {
      gates[0]?.()
      gates.shift()
      // let microtasks/timers run so the next chained dispatch begins
      await new Promise(resolve => setImmediate(resolve))
      await new Promise(resolve => setImmediate(resolve))
    }

    await tg.shutdown()

    expect(trace).toEqual([
      'start:1', 'end:1',
      'start:2', 'end:2',
      'start:3', 'end:3',
      'start:4', 'end:4',
      'start:5', 'end:5'
    ])
  })

  it('different keys dispatch in parallel up to concurrency cap', async () => {
    const tg = new Telegram({ token: 'X' })

    const updates = [
      makeUpdate(1, 100),
      makeUpdate(2, 200),
      makeUpdate(3, 300),
      makeUpdate(4, 400)
    ]

    let calls = 0

    stubApi(tg, {
      getMe: () => ({ id: 0, is_bot: true, first_name: 'bot', username: 'testbot' }),
      getUpdates: () => {
        calls++

        if (calls === 1) {
          return updates
        }

        tg.stopPolling()

        return []
      }
    })

    const running: Set<number> = new Set()
    let peak = 0
    const gates: (() => void)[] = []

    tg.onMessage(async (m) => {
      const id = m.raw.message_id

      running.add(id)
      peak = Math.max(peak, running.size)
      await new Promise<void>((resolve) => {
        gates.push(resolve)
      })
      running.delete(id)
    })

    await tg.startPolling({
      concurrency: 2,
      sequentializeBy: raw => String(raw.message?.chat.id ?? '')
    })

    // give the loop a couple ticks to spin up the first two dispatches
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    expect(running.size).toBe(2)
    expect(peak).toBe(2)

    // drain
    while (gates.length > 0) {
      gates.shift()?.()
      await new Promise(resolve => setImmediate(resolve))
      await new Promise(resolve => setImmediate(resolve))
    }

    await tg.shutdown()

    expect(peak).toBe(2)
  })

  it('unbounded concurrency by default — all updates start in parallel', async () => {
    const tg = new Telegram({ token: 'X' })

    const updates = [
      makeUpdate(1, 100),
      makeUpdate(2, 200),
      makeUpdate(3, 300)
    ]

    let calls = 0

    stubApi(tg, {
      getMe: () => ({ id: 0, is_bot: true, first_name: 'bot', username: 'testbot' }),
      getUpdates: () => {
        calls++

        if (calls === 1) {
          return updates
        }

        tg.stopPolling()

        return []
      }
    })

    let started = 0
    const gates: (() => void)[] = []

    tg.onMessage(async () => {
      started++
      await new Promise<void>((resolve) => {
        gates.push(resolve)
      })
    })

    await tg.startPolling()

    // all three should have started without any release
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    expect(started).toBe(3)

    for (const g of gates.splice(0)) {
      g()
    }

    await tg.shutdown()
  })
})
