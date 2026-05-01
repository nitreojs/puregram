import { Readable } from 'node:stream'

import { describe, expect, it } from 'vitest'

import { Telegram } from '../../src/telegram'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

const fakeReq = (body: string, headers: Record<string, string> = {}, method = 'POST') => {
  const stream = Readable.from([Buffer.from(body)])

  return Object.assign(stream, { method, headers }) as any
}

const fakeRes = () => {
  const captured: Record<string, string> = {}
  const res = {
    statusCode: 0,
    contentType: '',
    body: '',
    ended: false,
    writeHead (code: number, headers: Record<string, string> = {}) {
      this.statusCode = code
      Object.assign(captured, headers)
      this.contentType = headers['Content-Type'] ?? ''
    },
    end (chunk?: string) {
      this.body = chunk ?? ''
      this.ended = true
    }
  }

  return res as any
}

describe('hardening', () => {
  it('rejects oversized POST bodies with 413', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const cb = tg.getWebhookCallback({ maxBodyBytes: 100 })

    const big = JSON.stringify({ update_id: 1, blob: 'x'.repeat(200) })
    const res = fakeRes()

    await cb(fakeReq(big), res)

    expect(res.statusCode).toBe(413)
  })

  it('honours Content-Length pre-check before reading body', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const cb = tg.getWebhookCallback({ maxBodyBytes: 100 })

    const res = fakeRes()

    await cb(fakeReq('{}', { 'content-length': '999999' }), res)

    expect(res.statusCode).toBe(413)
  })

  it('start() retries cleanly after a failed bootstrap', async () => {
    let attempts = 0
    const tg = new Telegram({
      token: 'X',
      bot: STUB_BOT,
      httpClient: {
        async request () {
          attempts += 1

          if (attempts === 1) {
            throw new Error('network down')
          }

          return { status: 200, json: () => Promise.resolve({ ok: true, result: true }) }
        }
      }
    })

    tg.useHook('onInit', async () => {
      await tg.api.getMyName()
    })

    await expect(tg.start()).rejects.toThrow('network down')

    // first attempt poisoned nothing — second start succeeds
    await tg.start()
    expect(attempts).toBe(2)
  })

  it('shutdown runs registered cleanups exactly once', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    let cleaned = 0

    tg.registerCleanup(async () => {
      cleaned += 1
    })
    await tg.start()
    await tg.shutdown()
    await tg.shutdown()

    expect(cleaned).toBe(1)
  })

  it('shutdown swallows cleanup errors so subsequent cleanups still run', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    let secondRan = false

    tg.registerCleanup(() => Promise.reject(new Error('boom')))
    tg.registerCleanup(async () => {
      secondRan = true
    })
    await tg.start()
    await tg.shutdown()

    expect(secondRan).toBe(true)
  })
})

describe('webhook callback', () => {
  it('responds 405 to non-POST', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const cb = tg.getWebhookCallback()

    const req = { method: 'GET', headers: {} } as any
    const res = fakeRes()

    await cb(req, res)

    expect(res.ended).toBe(true)
    expect(res.statusCode).toBe(405)
  })

  it('responds 401 on bad secret token', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const cb = tg.getWebhookCallback({ secretToken: 'topsecret' })

    const received: unknown[] = []

    tg.onMessage((u) => {
      received.push(u)
    })

    const body = JSON.stringify({
      update_id: 1,
      message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' } }
    })
    const res = fakeRes()

    await cb(fakeReq(body, { 'x-telegram-bot-api-secret-token': 'wrong' }), res)
    await new Promise(resolve => setImmediate(resolve))

    expect(res.statusCode).toBe(401)
    expect(received).toHaveLength(0)
  })

  it('responds 400 on bad json', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const cb = tg.getWebhookCallback()

    const res = fakeRes()

    await cb(fakeReq('{not json'), res)

    expect(res.statusCode).toBe(400)
  })

  it('parses body, starts the bot, dispatches', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const cb = tg.getWebhookCallback()

    const received: unknown[] = []

    tg.onMessage((u) => {
      received.push(u)
    })

    const body = JSON.stringify({
      update_id: 1,
      message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text: 'x' }
    })
    const res = fakeRes()

    await cb(fakeReq(body), res)
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    expect(received).toHaveLength(1)
    expect(res.statusCode).toBe(200)
  })

  it('accepts a matching secret token', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const cb = tg.getWebhookCallback({ secretToken: 'topsecret' })

    const received: unknown[] = []

    tg.onMessage((u) => {
      received.push(u)
    })

    const body = JSON.stringify({
      update_id: 1,
      message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' } }
    })
    const res = fakeRes()

    await cb(fakeReq(body, { 'x-telegram-bot-api-secret-token': 'topsecret' }), res)
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    expect(res.statusCode).toBe(200)
    expect(received).toHaveLength(1)
  })

  it('start() runs once across concurrent webhook deliveries', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    let initRuns = 0

    tg.useHook('onInit', () => {
      initRuns += 1
    })

    const cb = tg.getWebhookCallback()
    const body = JSON.stringify({ update_id: 1, message: { message_id: 1, date: 0, chat: { id: 1, type: 'private' } } })

    await Promise.all([
      cb(fakeReq(body), fakeRes()),
      cb(fakeReq(body), fakeRes()),
      cb(fakeReq(body), fakeRes())
    ])

    expect(initRuns).toBe(1)
  })

  it('shutdown drains in-flight webhook dispatches', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const cb = tg.getWebhookCallback()

    let resolved = false

    tg.onMessage(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
      resolved = true
    })

    const body = JSON.stringify({ update_id: 1, message: { message_id: 1, date: 0, chat: { id: 1, type: 'private' } } })

    await cb(fakeReq(body), fakeRes())
    await tg.shutdown()

    expect(resolved).toBe(true)
  })
})

describe('webhook reply (transparent)', () => {
  const okJson = (result: unknown) => ({
    status: 200,
    json: () => Promise.resolve({ ok: true, result })
  })

  const recordingClient = (override?: (method: string) => unknown) => {
    const calls: string[] = []
    const client = {
      async request (input: { url: string }) {
        const method = input.url.split('?')[0]?.split('/').pop() ?? ''
        calls.push(method)

        if (override) {
          const out = override(method)

          if (out !== undefined) {
            return okJson(out)
          }
        }

        return okJson(true)
      }
    }

    return { client, calls }
  }

  it('safe methods (returns true) ride the webhook 200 body', async () => {
    const { client, calls } = recordingClient()
    const tg = new Telegram({ token: 'X', bot: STUB_BOT, httpClient: client })
    const cb = tg.getWebhookCallback()

    let observedReturn: unknown

    tg.onMessage(async (update) => {
      observedReturn = await tg.api.sendChatAction({ chat_id: update.raw.chat.id, action: 'typing' })
    })

    const body = JSON.stringify({
      update_id: 1,
      message: { message_id: 1, date: 0, chat: { id: 99, type: 'private' }, text: 'x' }
    })
    const res = fakeRes()

    await cb(fakeReq(body), res)
    await new Promise(resolve => setImmediate(resolve))

    // observable behavior — handler still got `true`, no http request happened
    expect(observedReturn).toBe(true)
    expect(calls).not.toContain('sendChatAction')
    expect(res.statusCode).toBe(200)
    expect(res.contentType).toBe('application/json')

    const payload = JSON.parse(res.body)

    expect(payload.method).toBe('sendChatAction')
    expect(payload.chat_id).toBe(99)
    expect(payload.action).toBe('typing')
  })

  it('data-returning methods (sendMessage) always round-trip — return value preserved', async () => {
    const { client, calls } = recordingClient(method => method === 'sendMessage' ? { message_id: 42 } : undefined)
    const tg = new Telegram({ token: 'X', bot: STUB_BOT, httpClient: client })
    const cb = tg.getWebhookCallback()

    let observed: unknown

    tg.onMessage(async (update) => {
      observed = await tg.api.sendMessage({ chat_id: update.raw.chat.id, text: 'hi' })
    })

    const body = JSON.stringify({
      update_id: 1,
      message: { message_id: 1, date: 0, chat: { id: 1, type: 'private' }, text: 'x' }
    })

    await cb(fakeReq(body), fakeRes())
    await tg.shutdown()

    expect(observed).toEqual({ message_id: 42 })
    expect(calls).toContain('sendMessage')
  })

  it('first safe call wins; subsequent safe calls round-trip', async () => {
    const { client, calls } = recordingClient()
    const tg = new Telegram({ token: 'X', bot: STUB_BOT, httpClient: client })
    const cb = tg.getWebhookCallback()

    tg.onMessage(async (update) => {
      await tg.api.sendChatAction({ chat_id: update.raw.chat.id, action: 'typing' })
      // already claimed — this one round-trips
      await tg.api.setMessageReaction({ chat_id: update.raw.chat.id, message_id: 1, reaction: [] })
    })

    const body = JSON.stringify({
      update_id: 1,
      message: { message_id: 1, date: 0, chat: { id: 1, type: 'private' } }
    })
    const res = fakeRes()

    await cb(fakeReq(body), res)
    await new Promise(resolve => setImmediate(resolve))

    expect(calls).not.toContain('sendChatAction')
    expect(calls).toContain('setMessageReaction')
    expect(JSON.parse(res.body).method).toBe('sendChatAction')
  })

  it('suppress: true forces round-trip even for safe methods', async () => {
    const { client, calls } = recordingClient()
    const tg = new Telegram({ token: 'X', bot: STUB_BOT, httpClient: client })
    const cb = tg.getWebhookCallback()

    tg.onMessage(async (update) => {
      await tg.api.sendChatAction({ chat_id: update.raw.chat.id, action: 'typing', suppress: true })
    })

    const body = JSON.stringify({
      update_id: 1,
      message: { message_id: 1, date: 0, chat: { id: 1, type: 'private' } }
    })

    await cb(fakeReq(body), fakeRes())
    await tg.shutdown()

    expect(calls).toContain('sendChatAction')
  })

  it('webhookReply: false disables the optimization — all calls round-trip', async () => {
    const { client, calls } = recordingClient()
    const tg = new Telegram({ token: 'X', bot: STUB_BOT, httpClient: client })
    const cb = tg.getWebhookCallback({ webhookReply: false })

    tg.onMessage(async (update) => {
      await tg.api.sendChatAction({ chat_id: update.raw.chat.id, action: 'typing' })
    })

    const body = JSON.stringify({
      update_id: 1,
      message: { message_id: 1, date: 0, chat: { id: 1, type: 'private' } }
    })
    const res = fakeRes()

    await cb(fakeReq(body), res)
    await tg.shutdown()

    expect(calls).toContain('sendChatAction')
    expect(res.body).toBe('')
  })

  it('respects timeout — empty 200 if no claim happens in time', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const cb = tg.getWebhookCallback({ timeoutMilliseconds: 20 })

    tg.onMessage(async () => {
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    const body = JSON.stringify({
      update_id: 1,
      message: { message_id: 1, date: 0, chat: { id: 99, type: 'private' }, text: 'x' }
    })
    const res = fakeRes()

    const start = Date.now()

    await cb(fakeReq(body), res)

    const elapsed = Date.now() - start

    expect(res.statusCode).toBe(200)
    expect(res.body).toBe('')
    expect(elapsed).toBeLessThan(150)

    await tg.shutdown()
  })
})
