import { describe, it, expect, vi } from 'vitest'

import { Telegram } from '../../src/telegram'

const stubApi = (tg: Telegram, methods: Record<string, (...args: any[]) => any>) => {
  const stub: Record<string, any> = {}

  for (const [name, fn] of Object.entries(methods)) {
    stub[name] = vi.fn().mockImplementation(fn)
  }

  Object.defineProperty(tg, 'api', { value: stub, configurable: true })
}

describe('polling', () => {
  it('dispatches updates to handlers', async () => {
    const tg = new Telegram({ token: 'X' })

    const updates = [
      { update_id: 1, message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text: 'hello' } }
    ]

    let calls = 0

    stubApi(tg, {
      getMe: () => ({ id: 0, is_bot: true, first_name: 'bot', username: 'testbot' }),
      getUpdates: () => {
        calls++

        if (calls > 1) {
          tg.stopPolling()

          return []
        }

        return updates
      }
    })

    const received: unknown[] = []

    tg.on('message', (u) => {
      received.push(u)
    })

    await tg.startPolling()

    expect(received).toHaveLength(1)
    expect((received[0] as { kind: string }).kind).toBe('message')
  })

  it('dropPendingUpdates returns count', async () => {
    const tg = new Telegram({ token: 'X' })

    let pulls = 0

    stubApi(tg, {
      getUpdates: () => {
        pulls++

        if (pulls === 1) {
          return [{ update_id: 1 }, { update_id: 2 }]
        }

        if (pulls === 2) {
          return [{ update_id: 3 }]
        }

        return []
      }
    })

    const dropped = await tg.dropPendingUpdates()

    expect(dropped).toBe(3)
  })
})
