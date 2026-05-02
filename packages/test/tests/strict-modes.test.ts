import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv, MembershipRequired } from '../src'

describe('strict modes', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('strictMembership throws MembershipRequired on send-without-join', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg, { strictMembership: true })

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const group = env.createChat({ type: 'supergroup', title: 'g' })

    await expect(alice.sendMessage(group, 'hi')).rejects.toThrow(MembershipRequired)
  })

  it('strictApi throws on unstubbed unknown method', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg, { strictApi: true })

    cleanup = () => env.shutdown()

    await expect(tg.api.call('definitelyNotAMethod', { x: 1 })).rejects.toThrow(/strictApi.*definitelyNotAMethod/i)
  })

  it('non-strictApi defaults to returning true for unknown methods', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const r = await tg.api.call('definitelyNotAMethod', { x: 1 })

    expect(r).toBe(true)
  })

  it('strictApi allows auto-stubbed methods (sendMessage etc)', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg, { strictApi: true })

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    const r = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'hi' }) as { message_id: number }

    expect(r.message_id).toBeGreaterThan(0)
  })

  it('strictDispatch throws when an injected update has no matching handler', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg, { strictDispatch: true })

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    await expect(alice.sendMessage('hi')).rejects.toThrow(/no.*handler.*message/i)
  })

  it('non-strictDispatch silently accepts updates with no handlers', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    await alice.sendMessage('hi')
  })
})
