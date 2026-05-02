import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

describe('actor scopes', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('user.in(chat).sendMessage(text) targets the bound chat', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: number[] = []

    tg.onMessage((u) => {
      seen.push(u.chat.id)
    })

    const alice = env.createUser()
    const group = env.createChat({ type: 'group', title: 'g' })

    await alice.in(group).sendMessage('hi')

    expect(seen).toEqual([group.id])
  })

  it('user.in(chat).sendPhoto routes through the bound chat', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: number[] = []

    tg.onMessage((u) => {
      if (u.raw.photo !== undefined) {
        seen.push(u.chat.id)
      }
    })

    const alice = env.createUser()
    const group = env.createChat({ type: 'group', title: 'g' })

    await alice.in(group).sendPhoto({ source: 'buffer', value: Buffer.from('p') })

    expect(seen).toEqual([group.id])
  })

  it('user.on(msg).react fires reaction on the bound message', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const msg = await alice.sendMessage('react please')

    await alice.on(msg).react('👍')

    expect(msg.reactions.get(alice.id)).toEqual(new Set(['👍']))
  })

  it('user.on(msg).reply(text) sends a message in the same chat with reply_to_message_id', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const replies: { chatId: number, replyTo: number | undefined }[] = []

    tg.onMessage((u) => {
      const replyToMessage = u.raw.reply_to_message as { message_id: number } | undefined

      replies.push({ chatId: u.chat.id, replyTo: replyToMessage?.message_id })
    })

    const alice = env.createUser()
    const target = await alice.sendMessage('original')

    replies.length = 0

    await alice.on(target).reply('replying to it')

    expect(replies).toHaveLength(1)
    expect(replies[0]?.chatId).toBe(alice.pmChat.id)
    expect(replies[0]?.replyTo).toBe(target.message_id)
  })
})
