import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

describe('TestUser (text)', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('createUser materializes an actor with a pm chat', () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser({ first_name: 'Alice' })

    expect(alice.first_name).toBe('Alice')
    expect(alice.is_bot).toBe(false)
    expect(alice.pmChat.type).toBe('private')
    expect(alice.pmChat.id).toBe(alice.id)
  })

  it('user.sendMessage produces a message update routed to a tg.onMessage handler', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: string[] = []

    tg.onMessage((u) => {
      seen.push(u.text ?? '')
    })

    const alice = env.createUser({ first_name: 'Alice' })

    await alice.sendMessage('hello world')

    expect(seen).toEqual(['hello world'])
  })

  it('handler that calls tg.api.sendMessage produces a recorded api call', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onMessage(async (u) => {
      await tg.api.sendMessage({ chat_id: u.chat.id, text: 'echo: ' + (u.text ?? '') })
    })

    const alice = env.createUser({ first_name: 'Alice' })

    await alice.sendMessage('hi')

    expect(env.callsTo('sendMessage')).toHaveLength(1)
    expect(env.lastApiCall('sendMessage')?.params).toMatchObject({
      chat_id: alice.pmChat.id,
      text: 'echo: hi'
    })
  })

  it('actor call awaits the full async handler chain', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    let handlerSettled = false

    tg.onMessage(async () => {
      await new Promise(resolve => setTimeout(resolve, 5))
      handlerSettled = true
    })

    const alice = env.createUser()

    await alice.sendMessage('hi')

    expect(handlerSettled).toBe(true)
  })
})
