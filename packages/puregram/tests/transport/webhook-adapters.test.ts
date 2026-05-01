import { describe, expect, it } from 'vitest'

import { Telegram } from '../../src/telegram'
import { elysiaAdapter } from '../../src/transport/webhook/adapters/elysia'
import { expressAdapter } from '../../src/transport/webhook/adapters/express'
import { fastifyAdapter } from '../../src/transport/webhook/adapters/fastify'
import { h3Adapter } from '../../src/transport/webhook/adapters/h3'
import { honoAdapter } from '../../src/transport/webhook/adapters/hono'
import { koaAdapter } from '../../src/transport/webhook/adapters/koa'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

const buildTg = () => {
  const tg = new Telegram({ token: 'X', bot: STUB_BOT })
  const received: unknown[] = []

  tg.onMessage((u) => {
    received.push(u)
  })

  return { tg, received }
}

const validUpdate = () => ({
  update_id: 1,
  message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text: 'x' }
})

describe('express adapter', () => {
  it('dispatches and replies 200', async () => {
    const { tg, received } = buildTg()
    const handler = expressAdapter(tg.webhookHandler())

    let status = 0
    let sent = ''
    const res: any = {
      status (code: number) {
        status = code

        return res
      },
      set () {
        return res
      },
      send (body: string) {
        sent = body

        return undefined
      }
    }

    await handler({ method: 'POST', headers: {}, body: validUpdate() }, res)
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    expect(status).toBe(200)
    expect(sent).toBe('')
    expect(received).toHaveLength(1)
  })
})

describe('koa adapter', () => {
  it('dispatches and replies 200', async () => {
    const { tg, received } = buildTg()
    const handler = koaAdapter(tg.webhookHandler())

    const ctx: any = {
      method: 'POST',
      headers: {},
      request: { body: validUpdate() },
      status: 0,
      body: undefined,
      set () {}
    }

    await handler(ctx)
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    expect(ctx.status).toBe(200)
    expect(received).toHaveLength(1)
  })
})

describe('fastify adapter', () => {
  it('dispatches and replies 200', async () => {
    const { tg, received } = buildTg()
    const handler = fastifyAdapter(tg.webhookHandler())

    let status = 0
    const reply: any = {
      code (code: number) {
        status = code

        return reply
      },
      header () {
        return reply
      },
      send () {
        return undefined
      }
    }

    await handler({ method: 'POST', headers: {}, body: validUpdate() }, reply)
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    expect(status).toBe(200)
    expect(received).toHaveLength(1)
  })
})

describe('hono adapter', () => {
  it('dispatches and replies 200', async () => {
    const { tg, received } = buildTg()
    const handler = honoAdapter(tg.webhookHandler())

    const request = new Request('https://example.com/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validUpdate())
    })

    const response = await handler({ req: { raw: request } })

    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    expect(response.status).toBe(200)
    expect(received).toHaveLength(1)
  })

  it('returns 401 on bad secret', async () => {
    const { tg } = buildTg()
    const handler = honoAdapter(tg.webhookHandler({ secretToken: 'topsecret' }))

    const request = new Request('https://example.com/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'wrong'
      },
      body: JSON.stringify(validUpdate())
    })

    const response = await handler({ req: { raw: request } })

    expect(response.status).toBe(401)
  })

  it('returns 405 on non-POST', async () => {
    const { tg } = buildTg()
    const handler = honoAdapter(tg.webhookHandler())

    const request = new Request('https://example.com/webhook', { method: 'GET' })
    const response = await handler({ req: { raw: request } })

    expect(response.status).toBe(405)
  })
})

describe('h3 adapter', () => {
  it('dispatches via web request', async () => {
    const { tg, received } = buildTg()
    const handler = h3Adapter(tg.webhookHandler())

    const request = new Request('https://example.com/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validUpdate())
    })

    const response = await handler({ web: { request }, node: { req: null, res: null } })

    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    expect(response.status).toBe(200)
    expect(received).toHaveLength(1)
  })

  it('throws when h3 v1 (no web request)', async () => {
    const { tg } = buildTg()
    const handler = h3Adapter(tg.webhookHandler())

    await expect(
      handler({ node: { req: null, res: null } })
    ).rejects.toThrow(/h3 v2/)
  })
})

describe('elysia adapter', () => {
  it('dispatches via Request', async () => {
    const { tg, received } = buildTg()
    const handler = elysiaAdapter(tg.webhookHandler())

    const request = new Request('https://example.com/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validUpdate())
    })

    const response = await handler({ request })

    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    expect(response.status).toBe(200)
    expect(received).toHaveLength(1)
  })
})
