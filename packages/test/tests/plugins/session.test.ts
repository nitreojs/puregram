import { session } from '@puregram/session'
import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

// side-effect import: makes env.session available
import '../../src/plugins/session'

describe('@puregram/test/session', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('reads + mutates session per user', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' }).extend(session())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    tg.onMessage(async (u) => {
      const s = (u as { session: { counter?: number } }).session

      s.counter = (s.counter ?? 0) + 1
      await tg.api.sendMessage({ chat_id: u.chat.id, text: `count=${s.counter}` })
    })

    await alice.sendMessage('hi')
    await alice.sendMessage('again')

    expect(env.lastApiCall('sendMessage')!.params.text).toBe('count=2')

    const aliceSession = env.session!(alice)

    expect(aliceSession.counter).toBe(2)
  })

  it('seed pre-populates the session before the test runs', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' }).extend(session())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    await env.session!.seed(alice, { counter: 100 })

    tg.onMessage(async (u) => {
      const s = (u as { session: { counter?: number } }).session

      s.counter = (s.counter ?? 0) + 1
      await tg.api.sendMessage({ chat_id: u.chat.id, text: `count=${s.counter}` })
    })

    await alice.sendMessage('hi')

    expect(env.lastApiCall('sendMessage')!.params.text).toBe('count=101')
  })

  it('env.session.raw(key) reads the underlying KV by raw key', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' }).extend(session())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    tg.onMessage(async (u) => {
      const s = (u as { session: Record<string, unknown> }).session

      s.x = 1
      await tg.api.sendMessage({ chat_id: u.chat.id, text: 'ok' })
    })

    await alice.sendMessage('hi')

    expect(await env.session!.raw(`user:${alice.id}:chat:${alice.id}`)).toEqual({ x: 1 })
    expect(env.session!(alice).x).toBe(1)
  })
})
