import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

describe('user lifecycle verbs', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('blocked user causes sendMessage to that pm to return 403', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    alice.block()

    await expect(tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'hi' }))
      .rejects.toThrow(/blocked by the user/)
  })

  it('unblock restores normal sendMessage behavior', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    alice.block()
    alice.unblock()

    const r = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'hi' }) as { message_id: number }

    expect(r.message_id).toBeGreaterThan(0)
  })

  it('block does not affect sends to other chats', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const bob = env.createUser()

    alice.block()

    const r = await tg.api.sendMessage({ chat_id: bob.pmChat.id, text: 'hi' }) as { message_id: number }

    expect(r.message_id).toBeGreaterThan(0)
  })

  it('setLanguage updates future updates language_code', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: (string | undefined)[] = []

    tg.onMessage((u) => {
      seen.push(u.from?.languageCode)
    })

    const alice = env.createUser()

    await alice.sendMessage('first')
    alice.setLanguage('ru')
    await alice.sendMessage('second')

    expect(seen).toEqual([undefined, 'ru'])
  })

  it('startBot sends /start as a message', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: string[] = []

    tg.onMessage((u) => {
      seen.push(u.text ?? '')
    })

    const alice = env.createUser()

    await alice.startBot()

    expect(seen).toEqual(['/start'])
  })

  it('startBot with payload sends /start <payload>', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: string[] = []

    tg.onMessage((u) => {
      seen.push(u.text ?? '')
    })

    const alice = env.createUser()

    await alice.startBot('promo123')

    expect(seen).toEqual(['/start promo123'])
  })
})
