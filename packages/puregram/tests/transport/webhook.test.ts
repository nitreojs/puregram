import { Readable } from 'node:stream'

import { describe, it, expect } from 'vitest'

import { Telegram } from '../../src/telegram'

const fakeReq = (body: string, headers: Record<string, string> = {}) => {
  const stream = Readable.from([Buffer.from(body)])

  return Object.assign(stream, { method: 'POST', headers }) as any
}

const fakeRes = () => {
  const res = {
    statusCode: 0,
    ended: false,
    writeHead (code: number) {
      this.statusCode = code
    },
    end () {
      this.ended = true
    }
  }

  return res as any
}

describe('webhook callback', () => {
  it('rejects non-POST', async () => {
    const tg = new Telegram({ token: 'X' })
    const cb = tg.getWebhookCallback()

    const req = { method: 'GET', headers: {} } as any
    const res = fakeRes()

    await cb(req, res)
    expect(res.ended).toBe(false)
  })

  it('parses body and dispatches', async () => {
    const tg = new Telegram({ token: 'X' })
    const cb = tg.getWebhookCallback()

    const received: unknown[] = []

    tg.on('message', u => {
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

  it('verifies secret token', async () => {
    const tg = new Telegram({ token: 'X' })
    const cb = tg.getWebhookCallback('topsecret')

    const received: unknown[] = []

    tg.on('message', u => {
      received.push(u)
    })

    const body = JSON.stringify({ update_id: 1, message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' } } })
    const res1 = fakeRes()

    await cb(fakeReq(body, { 'x-telegram-bot-api-secret-token': 'wrong' }), res1)
    await new Promise(resolve => setImmediate(resolve))
    expect(received).toHaveLength(0)

    const res2 = fakeRes()

    await cb(fakeReq(body, { 'x-telegram-bot-api-secret-token': 'topsecret' }), res2)
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))
    expect(received).toHaveLength(1)
  })
})
