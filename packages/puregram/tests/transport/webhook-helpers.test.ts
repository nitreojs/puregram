import { describe, expect, it } from 'vitest'

import type { HttpClient } from '../../src/http/client'
import { Telegram } from '../../src/telegram'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

const recordingClient = () => {
  const calls: { url: string, body: unknown }[] = []
  const client: HttpClient = {
    request (input) {
      let body: unknown

      if (input.init.body instanceof URLSearchParams) {
        body = Object.fromEntries(input.init.body.entries())
      } else if (typeof input.init.body === 'string') {
        try {
          body = JSON.parse(input.init.body)
        } catch {
          body = input.init.body
        }
      }

      calls.push({ url: input.url, body })

      return Promise.resolve({ status: 200, json: () => Promise.resolve({ ok: true, result: true }) })
    }
  }

  return { client, calls }
}

const lastQuery = (url: string) => {
  const qs = url.includes('?') ? url.slice(url.indexOf('?') + 1) : ''

  return Object.fromEntries(new URLSearchParams(qs).entries())
}

describe('webhook helpers', () => {
  it('setWebhook maps camelCase to snake_case', async () => {
    const { client, calls } = recordingClient()
    const tg = new Telegram({ token: 'X', bot: STUB_BOT, httpClient: client })

    await tg.setWebhook({
      url: 'https://example.com/wh',
      secretToken: 'sec',
      allowedUpdates: ['message'],
      maxConnections: 50,
      dropPendingUpdates: true,
      ipAddress: '1.2.3.4'
    })

    expect(calls).toHaveLength(1)
    expect(calls[0]?.url).toContain('/setWebhook')

    const params = lastQuery(calls[0]!.url)

    expect(params.url).toBe('https://example.com/wh')
    expect(params.secret_token).toBe('sec')
    expect(params.allowed_updates).toBe(JSON.stringify(['message']))
    expect(params.max_connections).toBe('50')
    expect(params.drop_pending_updates).toBe('true')
    expect(params.ip_address).toBe('1.2.3.4')
  })

  it('setWebhook omits undefined params', async () => {
    const { client, calls } = recordingClient()
    const tg = new Telegram({ token: 'X', bot: STUB_BOT, httpClient: client })

    await tg.setWebhook({ url: 'https://example.com/wh' })

    const params = lastQuery(calls[0]!.url)

    expect(params.url).toBe('https://example.com/wh')
    expect(params.secret_token).toBeUndefined()
    expect(params.max_connections).toBeUndefined()
  })

  it('deleteWebhook forwards dropPendingUpdates', async () => {
    const { client, calls } = recordingClient()
    const tg = new Telegram({ token: 'X', bot: STUB_BOT, httpClient: client })

    await tg.deleteWebhook({ dropPendingUpdates: true })

    expect(calls[0]?.url).toContain('/deleteWebhook')
    expect(lastQuery(calls[0]!.url).drop_pending_updates).toBe('true')
  })

  it('getWebhookInfo calls api.getWebhookInfo', async () => {
    const { client, calls } = recordingClient()
    const tg = new Telegram({ token: 'X', bot: STUB_BOT, httpClient: client })

    await tg.getWebhookInfo()

    expect(calls[0]?.url).toContain('/getWebhookInfo')
  })
})
