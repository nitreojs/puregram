import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

describe('TestChat creation', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('creates a supergroup with a title', () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const group = env.createChat({ type: 'supergroup', title: 'Devs' })

    expect(group.type).toBe('supergroup')
    expect(group.title).toBe('Devs')
    expect(group.id).toBeLessThan(0)
  })

  it('user.sendMessage(chat, text) targets a specific chat', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: number[] = []

    tg.onMessage((u) => {
      seen.push(u.chat.id)
    })

    const alice = env.createUser({ first_name: 'Alice' })
    const group = env.createChat({ type: 'group', title: 'g' })

    await alice.sendMessage(group, 'hi everyone')

    expect(seen).toEqual([group.id])
  })
})
