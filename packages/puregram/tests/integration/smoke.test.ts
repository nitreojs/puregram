import { describe, it, expect } from 'vitest'

import { Telegram, createPlugin } from '../../src'
import { MockTelegram } from '../helpers/mock-telegram'

describe('integration smoke', () => {
  it('end-to-end: extend plugin, start, dispatch one update via getUpdates', async () => {
    const mock = new MockTelegram()
    const baseUrl = await mock.start()

    try {
      mock.expect('getMe', { ok: true, result: { id: 1, is_bot: true, first_name: 'bot', username: 'testbot' } })

      let pulls = 0

      mock.expect('getUpdates', () => {
        pulls++

        if (pulls === 1) {
          return {
            ok: true,
            result: [
              { update_id: 1, message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text: '/start' } }
            ]
          }
        }

        return { ok: true, result: [] }
      })

      const session = createPlugin({
        name: 'session',
        install: () => ({ greetings: 0 })
      })

      const tg = new Telegram({ token: 'TEST', apiBaseUrl: baseUrl })
        .extend(session)

      const received: unknown[] = []

      tg.onMessage((u) => {
        received.push(u)
        ;(tg as any).session.greetings++

        if (pulls >= 1) {
          tg.stopPolling()
        }
      })

      await tg.startPolling()

      expect(received).toHaveLength(1)
      expect((tg as any).session.greetings).toBe(1)
    } finally {
      await mock.stop()
    }
  })

  it('end-to-end: tg.send goes through the lifecycle', async () => {
    const mock = new MockTelegram()
    const baseUrl = await mock.start()

    try {
      mock.expect('sendMessage', params => ({
        ok: true,
        result: { message_id: 42, date: 0, chat: { id: params.chat_id, type: 'private' }, text: params.text }
      }))

      const tg = new Telegram({ token: 'TEST', apiBaseUrl: baseUrl })
      const sent = await tg.send(100, 'hello')

      expect((sent as any).message_id).toBe(42)
    } finally {
      await mock.stop()
    }
  })

  it('end-to-end: suppress: true returns ApiResponseError', async () => {
    const mock = new MockTelegram()
    const baseUrl = await mock.start()

    try {
      mock.expect('sendMessage', { ok: false, error_code: 403, description: 'forbidden' })

      const tg = new Telegram({ token: 'TEST', apiBaseUrl: baseUrl })
      const result = await (tg.api as any).sendMessage({ chat_id: 1, text: 'x', suppress: true })

      expect(Telegram.isErrorResponse(result)).toBe(true)
      expect((result).error_code).toBe(403)
    } finally {
      await mock.stop()
    }
  })
})
