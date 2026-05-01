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

describe('webhook reply', () => {
  it('returns response 200 with method body when handler claims slot', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const cb = tg.getWebhookCallback({ webhookReply: 'auto' })

    tg.onMessage(async (update) => {
      await tg.api.sendMessage({ chat_id: update.raw.chat.id, text: 'hi' })
    })

    const body = JSON.stringify({
      update_id: 1,
      message: { message_id: 1, date: 0, chat: { id: 99, type: 'private' }, text: 'x' }
    })
    const res = fakeRes()

    await cb(fakeReq(body), res)
    await new Promise(resolve => setImmediate(resolve))

    expect(res.statusCode).toBe(200)
    expect(res.contentType).toBe('application/json')

    const payload = JSON.parse(res.body)

    expect(payload.method).toBe('sendMessage')
    expect(payload.chat_id).toBe(99)
    expect(payload.text).toBe('hi')
  })

  it('respects timeout — sends empty 200 when slot stays unclaimed', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const cb = tg.getWebhookCallback({ webhookReply: 'auto', timeoutMilliseconds: 20 })

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
