import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

describe('world: reactions', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('user.react emits message_reaction with correct old/new', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const events: { old: string[], new: string[] }[] = []

    tg.onMessageReaction((u) => {
      const old = (u.raw.old_reaction as { emoji: string }[]).map(r => r.emoji)
      const next = (u.raw.new_reaction as { emoji: string }[]).map(r => r.emoji)

      events.push({ old, new: next })
    })

    const alice = env.createUser()
    const msg = await alice.sendMessage('react please')

    await alice.react('👍', msg)

    expect(events).toEqual([{ old: [], new: ['👍'] }])

    await alice.react(['👍', '❤'], msg)

    expect(events[1]).toEqual({ old: ['👍'], new: ['👍', '❤'] })
  })

  it('reactions are tracked per (chat, message, user)', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser({ first_name: 'Alice' })
    const bob = env.createUser({ first_name: 'Bob' })
    const group = env.createChat({ type: 'group', title: 'g' })

    const msg = await alice.sendMessage(group, 'hi')

    await alice.react('👍', msg)
    await bob.react('❤', msg)

    expect(msg.reactions.get(alice.id)).toEqual(new Set(['👍']))
    expect(msg.reactions.get(bob.id)).toEqual(new Set(['❤']))
  })

  it('clearing a reaction (empty array) removes user from reactions map', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const msg = await alice.sendMessage('hi')

    await alice.react('👍', msg)
    expect(msg.reactions.has(alice.id)).toBe(true)

    await alice.react([], msg)
    expect(msg.reactions.has(alice.id)).toBe(false)
  })

  it('setMessageReaction (bot side) emits message_reaction with bot as actor', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const sent = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'hi' }) as { message_id: number }

    await tg.api.setMessageReaction({
      chat_id: alice.pmChat.id,
      message_id: sent.message_id,
      reaction: [{ type: 'emoji', emoji: '🔥' }]
    })

    const msg = alice.pmChat.messages.find(m => m.message_id === sent.message_id)

    expect(msg?.reactions.get(env.bot.id)).toEqual(new Set(['🔥']))
  })
})
