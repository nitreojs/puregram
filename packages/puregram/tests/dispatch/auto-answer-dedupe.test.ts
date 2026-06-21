import { describe, it, expect, vi } from 'vitest'

import type { HttpRequestInput } from '../../src/http/client'
import { Telegram } from '../../src/telegram'

// subclass to reach the protected dispatch entry without casts
class TestBot extends Telegram {
  feed (raw: Record<string, unknown>) {
    return this.handleIncoming(raw)
  }
}

const messageRaw = (updateId: number) => ({
  update_id: updateId,
  message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, from: { id: 1, is_bot: false, first_name: 'x' }, text: 'hi' }
})

const callbackRaw = (updateId: number) => ({
  update_id: updateId,
  callback_query: { id: 'cb1', from: { id: 1, is_bot: false, first_name: 'x' }, chat_instance: 'ci', data: 'x' }
})

const recordingClient = () => {
  const urls: string[] = []
  const request = vi.fn((input: HttpRequestInput) => {
    urls.push(input.url)

    return Promise.resolve({ status: 200, json: () => Promise.resolve({ ok: true, result: true }) })
  })

  return { urls, request, httpClient: { request } }
}

describe('dedupeUpdates', () => {
  it('drops a repeated update_id', async () => {
    const tg = new TestBot({ token: 'X', dedupeUpdates: true })
    let count = 0

    tg.onMessage(() => {
      count += 1
    })

    await tg.feed(messageRaw(7))
    await tg.feed(messageRaw(7))

    expect(count).toBe(1)
  })

  it('dispatches duplicates when disabled (default)', async () => {
    const tg = new TestBot({ token: 'X' })
    let count = 0

    tg.onMessage(() => {
      count += 1
    })

    await tg.feed(messageRaw(7))
    await tg.feed(messageRaw(7))

    expect(count).toBe(2)
  })

  it('evicts the oldest id past the window', async () => {
    const tg = new TestBot({ token: 'X', dedupeUpdates: { max: 2 } })
    let count = 0

    tg.onMessage(() => {
      count += 1
    })

    await tg.feed(messageRaw(1))
    await tg.feed(messageRaw(2))
    await tg.feed(messageRaw(3))
    await tg.feed(messageRaw(1))

    expect(count).toBe(4)
  })
})

describe('autoAnswerCallbackQuery', () => {
  it('answers a callback no handler answered', async () => {
    const { urls, request, httpClient } = recordingClient()
    const tg = new TestBot({ token: 'X', autoAnswerCallbackQuery: true, httpClient })

    tg.onCallbackQuery(() => {})

    await tg.feed(callbackRaw(1))

    expect(request).toHaveBeenCalledTimes(1)
    expect(urls[0]).toContain('answerCallbackQuery')
  })

  it('does not double-answer when a handler already answered', async () => {
    const { request, httpClient } = recordingClient()
    const tg = new TestBot({ token: 'X', autoAnswerCallbackQuery: true, httpClient })

    tg.onCallbackQuery(async (update) => {
      await update.answer({ text: 'hi' })
    })

    await tg.feed(callbackRaw(1))

    expect(request).toHaveBeenCalledTimes(1)
  })

  it('is off by default', async () => {
    const { request, httpClient } = recordingClient()
    const tg = new TestBot({ token: 'X', httpClient })

    tg.onCallbackQuery(() => {})

    await tg.feed(callbackRaw(1))

    expect(request).not.toHaveBeenCalled()
  })

  it('uses configured default params', async () => {
    const { urls, httpClient } = recordingClient()
    const tg = new TestBot({ token: 'X', autoAnswerCallbackQuery: { text: 'done' }, httpClient })

    tg.onCallbackQuery(() => {})

    await tg.feed(callbackRaw(1))

    expect(urls[0]).toContain('done')
  })
})
