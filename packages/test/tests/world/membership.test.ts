import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv, MembershipRequired } from '../../src'

describe('world: membership', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('user defaults to left in groups; bot defaults to administrator', () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const group = env.createChat({ type: 'supergroup', title: 'g' })

    expect(group.membershipOf(alice).status).toBe('left')
    expect(group.botMembership().status).toBe('administrator')
  })

  it('user.join emits chat_member and flips status to member', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const events: { old: string, new: string }[] = []

    tg.onChatMember((u) => {
      const oldStatus = (u.raw.old_chat_member as { status: string }).status
      const newStatus = (u.raw.new_chat_member as { status: string }).status

      events.push({ old: oldStatus, new: newStatus })
    })

    const alice = env.createUser()
    const group = env.createChat({ type: 'supergroup', title: 'g' })

    await alice.join(group)

    expect(events).toEqual([{ old: 'left', new: 'member' }])
    expect(group.membershipOf(alice).status).toBe('member')
  })

  it('user.leave emits chat_member and flips to left', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const group = env.createChat({ type: 'supergroup', title: 'g' })

    await alice.join(group)

    const events: { new: string }[] = []

    tg.onChatMember((u) => {
      events.push({ new: (u.raw.new_chat_member as { status: string }).status })
    })

    await alice.leave(group)

    expect(events).toEqual([{ new: 'left' }])
    expect(group.membershipOf(alice).status).toBe('left')
  })

  it('lenient mode auto-joins on first send (no chat_member emitted)', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const memberEvents: unknown[] = []
    const messageEvents: number[] = []

    tg.onChatMember(() => {
      memberEvents.push(1)
    })
    tg.onMessage((u) => {
      messageEvents.push(u.chat.id)
    })

    const alice = env.createUser()
    const group = env.createChat({ type: 'supergroup', title: 'g' })

    await alice.sendMessage(group, 'hi')

    expect(memberEvents).toHaveLength(0)
    expect(messageEvents).toEqual([group.id])
    expect(group.membershipOf(alice).status).toBe('member')
  })

  it('strict mode throws MembershipRequired on send-without-join', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg, { strictMembership: true })

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const group = env.createChat({ type: 'supergroup', title: 'g' })

    await expect(alice.sendMessage(group, 'hi')).rejects.toThrow(MembershipRequired)
  })

  it('banChatMember flips bot-side; getChatMember reflects state', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const group = env.createChat({ type: 'supergroup', title: 'g' })

    await alice.join(group)
    await tg.api.banChatMember({ chat_id: group.id, user_id: alice.id })

    expect(group.membershipOf(alice).status).toBe('kicked')

    const member = await tg.api.getChatMember({ chat_id: group.id, user_id: alice.id }) as {
      status: string
      user: { id: number }
    }

    expect(member.status).toBe('kicked')
    expect(member.user.id).toBe(alice.id)
  })

  it('getChatMemberCount returns the count of joined users plus the bot', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const bob = env.createUser()
    const group = env.createChat({ type: 'supergroup', title: 'g' })

    await alice.join(group)
    await bob.join(group)

    const count = await tg.api.getChatMemberCount({ chat_id: group.id })

    expect(count).toBe(3)
  })
})
