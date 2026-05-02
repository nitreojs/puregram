import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../src'
import {
  CallbackQueryBuilder,
  ChosenInlineResultBuilder,
  InlineQueryBuilder,
  MessageBuilder,
  ReactionBuilder
} from '../src/builders'

describe('builders + env.inject', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('MessageBuilder produces a valid raw update', () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser({ first_name: 'Alice' })
    const update = new MessageBuilder({ text: 'hi' })
      .from(alice)
      .chat(alice.pmChat)
      .toUpdate()

    expect(update).toMatchObject({
      update_id: expect.any(Number),
      message: {
        message_id: expect.any(Number),
        date: expect.any(Number),
        from: { id: alice.id, first_name: 'Alice' },
        chat: { id: alice.pmChat.id, type: 'private' },
        text: 'hi'
      }
    })
  })

  it('env.inject feeds the built update through dispatch', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: string[] = []

    tg.onMessage((u) => {
      seen.push(u.text ?? '')
    })

    const alice = env.createUser()
    const update = new MessageBuilder({ text: 'injected' })
      .from(alice)
      .chat(alice.pmChat)
      .toUpdate()

    await env.inject(update)

    expect(seen).toEqual(['injected'])
  })

  it('CallbackQueryBuilder routes through dispatch', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: string[] = []

    tg.onCallbackQuery((u) => {
      seen.push(u.raw.data ?? '')
    })

    const alice = env.createUser()
    const msg = await alice.sendMessage('hi')
    const update = new CallbackQueryBuilder()
      .from(alice)
      .data('opt:1')
      .message(msg)
      .toUpdate()

    await env.inject(update)

    expect(seen).toEqual(['opt:1'])
  })

  it('InlineQueryBuilder routes through dispatch', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: string[] = []

    tg.onInlineQuery((u) => {
      seen.push(u.raw.query)
    })

    const alice = env.createUser()
    const update = new InlineQueryBuilder()
      .from(alice)
      .query('cats')
      .toUpdate()

    await env.inject(update)

    expect(seen).toEqual(['cats'])
  })

  it('ChosenInlineResultBuilder routes through dispatch', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: { id: string, q: string }[] = []

    tg.onChosenInlineResult((u) => {
      seen.push({ id: u.raw.result_id, q: u.raw.query })
    })

    const alice = env.createUser()
    const update = new ChosenInlineResultBuilder()
      .from(alice)
      .resultId('result-1')
      .query('cats')
      .toUpdate()

    await env.inject(update)

    expect(seen).toEqual([{ id: 'result-1', q: 'cats' }])
  })

  it('ReactionBuilder routes through dispatch', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: string[][] = []

    tg.onMessageReaction((u) => {
      seen.push((u.raw.new_reaction as { emoji: string }[]).map(r => r.emoji))
    })

    const alice = env.createUser()
    const msg = await alice.sendMessage('hi')
    const update = new ReactionBuilder()
      .from(alice)
      .on(msg)
      .add('🔥', '👍')
      .toUpdate()

    await env.inject(update)

    expect(seen).toEqual([['🔥', '👍']])
  })

  it('env.inject auto-fills update_id when missing', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: string[] = []

    tg.onMessage((u) => {
      seen.push(u.text ?? '')
    })

    const alice = env.createUser()

    // hand-built raw update without update_id
    await env.inject({
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        from: alice.toRaw(),
        chat: alice.pmChat.toRaw(),
        text: 'hand-built'
      }
    })

    expect(seen).toEqual(['hand-built'])
  })
})
