import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../src'

describe('error propagation', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('handler that throws propagates to the actor call', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onMessage(() => {
      throw new Error('boom')
    })

    const alice = env.createUser()

    await expect(alice.sendMessage('hi')).rejects.toThrow('boom')
  })

  it('multiple handlers: at least the first error propagates', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onMessage(() => {
      throw new Error('first')
    })
    tg.onMessage(() => {
      throw new Error('second')
    })

    const alice = env.createUser()

    await expect(alice.sendMessage('hi')).rejects.toThrow(/first|second/)
  })
})
