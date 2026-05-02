import { rateLimit, rateLimitMiddleware } from '@puregram/rate-limit'
import { Telegram, type Middleware } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

// side-effect import: makes env.rateLimit available
import '../../src/plugins/rate-limit'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as never

describe('@puregram/test/rate-limit', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('usage(key) returns empty/zero state for an untouched bucket', () => {
    const tg = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(rateLimit())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    expect(env.rateLimit!.usage('default:42')).toEqual({ hits: 0, resetAt: 0 })
  })

  it('usage(key) reflects hit count after raw hits', async () => {
    const tg = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(rateLimit())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    await tg.rateLimit.hit('default:7', 5, 60)
    await tg.rateLimit.hit('default:7', 5, 60)

    const state = env.rateLimit!.usage('default:7')

    expect(state.hits).toBe(2)
    expect(state.resetAt).toBeGreaterThan(Date.now())
  })

  it('reset(key) clears a single bucket', async () => {
    const tg = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(rateLimit())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    await tg.rateLimit.hit('default:1', 3, 60)
    await tg.rateLimit.hit('default:2', 3, 60)

    expect(env.rateLimit!.usage('default:1').hits).toBe(1)
    expect(env.rateLimit!.usage('default:2').hits).toBe(1)

    await env.rateLimit!.reset('default:1')

    expect(env.rateLimit!.usage('default:1')).toEqual({ hits: 0, resetAt: 0 })
    expect(env.rateLimit!.usage('default:2').hits).toBe(1)
  })

  it('reset() clears all buckets', async () => {
    const tg = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(rateLimit())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    await tg.rateLimit.hit('default:1', 3, 60)
    await tg.rateLimit.hit('default:2', 3, 60)
    await tg.rateLimit.hit('cb:3', 3, 60)

    await env.rateLimit!.reset()

    expect(env.rateLimit!.usage('default:1')).toEqual({ hits: 0, resetAt: 0 })
    expect(env.rateLimit!.usage('default:2')).toEqual({ hits: 0, resetAt: 0 })
    expect(env.rateLimit!.usage('cb:3')).toEqual({ hits: 0, resetAt: 0 })
  })

  it('lastRejection() is undefined before any block', () => {
    const tg = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(rateLimit())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    expect(env.rateLimit!.lastRejection()).toBeUndefined()
  })

  it('lastRejection() captures a denied hit via tg.rateLimit.hit', async () => {
    const tg = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(rateLimit())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const before = Date.now()

    await tg.rateLimit.hit('default:9', 1, 60)

    expect(env.rateLimit!.lastRejection()).toBeUndefined()

    await tg.rateLimit.hit('default:9', 1, 60)

    const last = env.rateLimit!.lastRejection()

    expect(last).toBeDefined()
    expect(last!.key).toBe('default:9')
    expect(typeof last!.reason).toBe('string')
    expect(last!.at).toBeGreaterThanOrEqual(before)
  })

  it('lastRejection() captures rejection through middleware-gated dispatch', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot', bot: STUB_BOT })
      .extend(rateLimit())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.use(rateLimitMiddleware(tg, { limit: 1, window: 60, bucket: 'msg' }) as Middleware<unknown>, { priority: 'high' })

    let handlerCalls = 0

    tg.onMessage(async (u) => {
      handlerCalls += 1
      await tg.api.sendMessage({ chat_id: u.chat.id, text: 'pong' })
    })

    const alice = env.createUser()

    await alice.sendMessage('one')
    await alice.sendMessage('two')

    expect(handlerCalls).toBe(1)

    const last = env.rateLimit!.lastRejection()

    expect(last).toBeDefined()
    expect(last!.key).toBe(`msg:${alice.id}`)
  })
})
