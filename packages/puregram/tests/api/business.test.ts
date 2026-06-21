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

describe('tg.business', () => {
  it('injects business_connection_id into every call', async () => {
    const { urls, httpClient } = recordingClient()
    const tg = new Telegram({ token: 'X', httpClient })

    await tg.business('biz_123').sendMessage({ chat_id: 1, text: 'hi' })

    expect(urls[0]).toContain('business_connection_id=biz_123')
  })

  it('lets a call-site business_connection_id override the bound one', async () => {
    const { urls, httpClient } = recordingClient()
    const tg = new Telegram({ token: 'X', httpClient })

    await tg.business('bound').sendMessage({ chat_id: 1, text: 'hi', business_connection_id: 'override' })

    expect(urls[0]).toContain('business_connection_id=override')
    expect(urls[0]).not.toContain('bound')
  })

  it('does not affect the unscoped tg.api', async () => {
    const { urls, httpClient } = recordingClient()
    const tg = new Telegram({ token: 'X', httpClient })

    await tg.api.sendMessage({ chat_id: 1, text: 'hi' })

    expect(urls[0]).not.toContain('business_connection_id')
  })
})
