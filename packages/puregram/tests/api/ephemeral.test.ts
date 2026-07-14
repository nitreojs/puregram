import { describe, it, expect, vi } from 'vitest'

import type { HttpRequestInput } from '../../src/http/client'
import { Telegram } from '../../src/telegram'

const recordingClient = () => {
  const urls: string[] = []
  const request = vi.fn((input: HttpRequestInput) => {
    urls.push(input.url)

    return Promise.resolve({ status: 200, json: () => Promise.resolve({ ok: true, result: { message_id: 1 } }) })
  })

  return { urls, httpClient: { request } }
}

describe('tg.ephemeral', () => {
  it('injects receiver_user_id into every call', async () => {
    const { urls, httpClient } = recordingClient()
    const tg = new Telegram({ token: 'X', httpClient })

    await tg.ephemeral(5).sendMessage({ chat_id: 1, text: 'x' })

    expect(urls[0]).toContain('sendMessage')
    expect(urls[0]).toContain('receiver_user_id=5')
    expect(urls[0]).not.toContain('callback_query_id')
  })

  it('also injects callback_query_id when provided', async () => {
    const { urls, httpClient } = recordingClient()
    const tg = new Telegram({ token: 'X', httpClient })

    await tg.ephemeral(5, 'cbq_42').sendMessage({ chat_id: 1, text: 'x' })

    expect(urls[0]).toContain('receiver_user_id=5')
    expect(urls[0]).toContain('callback_query_id=cbq_42')
  })

  it('lets a call-site receiver_user_id override the bound one', async () => {
    const { urls, httpClient } = recordingClient()
    const tg = new Telegram({ token: 'X', httpClient })

    await tg.ephemeral(5).sendMessage({ chat_id: 1, text: 'x', receiver_user_id: 7 })

    expect(urls[0]).toContain('receiver_user_id=7')
    expect(urls[0]).not.toContain('receiver_user_id=5')
  })

  it('does not affect the unscoped tg.api', async () => {
    const { urls, httpClient } = recordingClient()
    const tg = new Telegram({ token: 'X', httpClient })

    await tg.api.sendMessage({ chat_id: 1, text: 'x' })

    expect(urls[0]).not.toContain('receiver_user_id')
  })
})
