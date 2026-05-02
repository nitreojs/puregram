import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

describe('world: pinned', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('pinChatMessage pushes to pinnedMessages', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const sent = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'pin me' }) as { message_id: number }

    await tg.api.pinChatMessage({ chat_id: alice.pmChat.id, message_id: sent.message_id })

    expect(alice.pmChat.pinnedMessages).toHaveLength(1)
    expect(alice.pmChat.pinnedMessages[0]?.message_id).toBe(sent.message_id)
  })

  it('unpinChatMessage removes a specific pin', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const a = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'a' }) as { message_id: number }
    const b = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'b' }) as { message_id: number }

    await tg.api.pinChatMessage({ chat_id: alice.pmChat.id, message_id: a.message_id })
    await tg.api.pinChatMessage({ chat_id: alice.pmChat.id, message_id: b.message_id })

    expect(alice.pmChat.pinnedMessages).toHaveLength(2)

    await tg.api.unpinChatMessage({ chat_id: alice.pmChat.id, message_id: a.message_id })

    expect(alice.pmChat.pinnedMessages).toHaveLength(1)
    expect(alice.pmChat.pinnedMessages[0]?.message_id).toBe(b.message_id)
  })

  it('unpinAllChatMessages clears them', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const a = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'a' }) as { message_id: number }
    const b = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'b' }) as { message_id: number }

    await tg.api.pinChatMessage({ chat_id: alice.pmChat.id, message_id: a.message_id })
    await tg.api.pinChatMessage({ chat_id: alice.pmChat.id, message_id: b.message_id })
    await tg.api.unpinAllChatMessages({ chat_id: alice.pmChat.id })

    expect(alice.pmChat.pinnedMessages).toHaveLength(0)
  })

  it('user.pinMessage emits pinned_message service event', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: string[] = []

    tg.onPinnedMessage((u) => {
      seen.push(u.kind)
    })

    const alice = env.createUser()
    const sent = await alice.sendMessage('hi')

    await alice.pinMessage(sent)

    expect(seen).toEqual(['pinned_message'])
    expect(alice.pmChat.pinnedMessages).toHaveLength(1)
  })
})
