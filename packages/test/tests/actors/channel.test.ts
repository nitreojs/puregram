import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

describe('TestChat channel posts', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('channel.post emits a channel_post update with no from', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: { kind: string, hasFrom: boolean }[] = []

    tg.onChannelPost((u) => {
      seen.push({ kind: u.kind, hasFrom: u.from !== undefined })
    })

    const channel = env.createChat({ type: 'channel', title: 'News' })

    await channel.post('breaking')

    expect(seen).toEqual([{ kind: 'channel_post', hasFrom: false }])
  })

  it('post throws on non-channel chats', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    await expect((alice.pmChat as unknown as { post: (text: string) => Promise<unknown> }).post('x'))
      .rejects.toThrow(/only valid for channel/)
  })
})
