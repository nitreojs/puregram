import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

describe('callback queries and inline queries', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('user.click emits a callback_query update', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: { data: string, fromId: number, msgId: number }[] = []

    tg.onCallbackQuery((u) => {
      seen.push({
        data: (u.raw.data as string) ?? '',
        fromId: (u.raw.from as { id: number }).id,
        msgId: (u.raw.message as { message_id: number } | undefined)?.message_id ?? 0
      })
    })

    const alice = env.createUser()
    const msg = await alice.sendMessage('hi')

    await alice.click('opt:1', msg)

    expect(seen).toEqual([{ data: 'opt:1', fromId: alice.id, msgId: msg.message_id }])
  })

  it('user.on(msg).click proxies to user.click', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: string[] = []

    tg.onCallbackQuery((u) => {
      seen.push((u.raw.data as string) ?? '')
    })

    const alice = env.createUser()
    const msg = await alice.sendMessage('hi')

    await alice.on(msg).click('confirm')

    expect(seen).toEqual(['confirm'])
  })

  it('user.clickByText resolves a button text to its callback_data', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: string[] = []

    tg.onCallbackQuery((u) => {
      seen.push((u.raw.data as string) ?? '')
    })

    const alice = env.createUser()

    await tg.api.sendMessage({
      chat_id: alice.pmChat.id,
      text: 'pick',
      reply_markup: {
        inline_keyboard: [[
          { text: 'Confirm', callback_data: 'cd:confirm' },
          { text: 'Cancel', callback_data: 'cd:cancel' }
        ]]
      }
    })

    const botMsg = alice.pmChat.lastMessage

    if (botMsg === undefined) {
      throw new Error('expected bot message')
    }

    await alice.clickByText('Confirm', botMsg)

    expect(seen).toEqual(['cd:confirm'])
  })

  it('clickByText throws if no button matches', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const msg = await alice.sendMessage('hi')

    await expect(alice.clickByText('Nope', msg)).rejects.toThrow(/no button/i)
  })

  it('user.sendInlineQuery emits an inline_query update', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: { q: string, offset: string }[] = []

    tg.onInlineQuery((u) => {
      seen.push({ q: u.raw.query, offset: u.raw.offset ?? '' })
    })

    const alice = env.createUser()

    await alice.sendInlineQuery('cats')

    expect(seen).toEqual([{ q: 'cats', offset: '' }])
  })

  it('user.sendInlineQuery passes offset option', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: { q: string, offset: string }[] = []

    tg.onInlineQuery((u) => {
      seen.push({ q: u.raw.query, offset: u.raw.offset ?? '' })
    })

    const alice = env.createUser()

    await alice.sendInlineQuery('dogs', { offset: '10' })

    expect(seen).toEqual([{ q: 'dogs', offset: '10' }])
  })

  it('user.chooseInlineResult emits a chosen_inline_result update', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const seen: { resultId: string, query: string }[] = []

    tg.onChosenInlineResult((u) => {
      seen.push({
        resultId: u.raw.result_id,
        query: u.raw.query
      })
    })

    const alice = env.createUser()

    await alice.chooseInlineResult('result-1', 'cats')

    expect(seen).toEqual([{ resultId: 'result-1', query: 'cats' }])
  })
})
