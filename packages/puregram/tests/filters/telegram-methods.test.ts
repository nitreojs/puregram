import type { CallbackQueryUpdate, ChosenInlineResultUpdate, InlineQueryUpdate, MessageUpdate, NewChatMembersUpdate } from '@puregram/api'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import type { UpdateHandler } from '../../src/dispatch/on'
import { Telegram } from '../../src/telegram'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

const messageUpdate = (text?: string) => ({
  kind: 'message',
  raw: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text }
})

const callbackUpdate = (data: string) => ({
  kind: 'callback_query',
  raw: {
    id: 'cb1',
    from: { id: 1, is_bot: false, first_name: 'x' },
    chat_instance: 'ci',
    data
  }
})

const inlineQueryUpdate = (query: string) => ({
  kind: 'inline_query',
  raw: {
    id: 'iq1',
    from: { id: 1, is_bot: false, first_name: 'x' },
    query,
    offset: ''
  }
})

const chosenInlineResultUpdate = (result_id: string) => ({
  kind: 'chosen_inline_result',
  raw: {
    result_id,
    from: { id: 1, is_bot: false, first_name: 'x' },
    query: ''
  }
})

const newChatMembersUpdate = () => ({
  kind: 'new_chat_members',
  raw: {
    message_id: 1,
    date: 0,
    chat: { id: 100, type: 'group' },
    new_chat_members: [{ id: 2, is_bot: false, first_name: 'joiner' }]
  }
})

describe('tg.command regression after K.8 refactor', () => {
  it('matches /name and skips other text', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const seen: string[] = []
    const fellThrough: string[] = []

    tg.command('hello', (message) => {
      seen.push(message.raw.text!)
    })
    tg.on('message', (message) => {
      fellThrough.push(message.raw.text!)
    })

    await (tg as any).dispatch(messageUpdate('/hello'))
    await (tg as any).dispatch(messageUpdate('/world'))

    expect(seen).toEqual(['/hello'])
    expect(fellThrough).toEqual(['/world'])
  })

  it('infers handler argument as MessageUpdate at the call site', () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const handler: UpdateHandler<MessageUpdate> = () => undefined

    tg.command('foo', handler)

    expectTypeOf<Parameters<typeof handler>[0]>().toMatchTypeOf<MessageUpdate>()
  })
})

describe('tg.callbackData', () => {
  it('registers a handler that fires on matching callback_query', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const handler = vi.fn()

    tg.callbackData('buy', handler)

    await (tg as any).dispatch(callbackUpdate('buy'))
    await (tg as any).dispatch(callbackUpdate('sell'))
    await (tg as any).dispatch(messageUpdate('hi'))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('handler infers as UpdateHandler<CallbackQueryUpdate>', () => {
    const handler: UpdateHandler<CallbackQueryUpdate> = () => undefined

    expectTypeOf<Parameters<typeof handler>[0]>().toMatchTypeOf<CallbackQueryUpdate>()
  })
})

describe('tg.inlineQuery', () => {
  it('registers a handler that fires on matching inline_query', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const handler = vi.fn()

    tg.inlineQuery('search', handler)

    await (tg as any).dispatch(inlineQueryUpdate('search'))
    await (tg as any).dispatch(inlineQueryUpdate('other'))
    await (tg as any).dispatch(callbackUpdate('buy'))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('handler infers as UpdateHandler<InlineQueryUpdate>', () => {
    const handler: UpdateHandler<InlineQueryUpdate> = () => undefined

    expectTypeOf<Parameters<typeof handler>[0]>().toMatchTypeOf<InlineQueryUpdate>()
  })
})

describe('tg.chosenInlineResult', () => {
  it('registers a handler that fires on matching chosen_inline_result', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const handler = vi.fn()

    tg.chosenInlineResult('a', handler)

    await (tg as any).dispatch(chosenInlineResultUpdate('a'))
    await (tg as any).dispatch(chosenInlineResultUpdate('b'))
    await (tg as any).dispatch(messageUpdate('hi'))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('handler infers as UpdateHandler<ChosenInlineResultUpdate>', () => {
    const handler: UpdateHandler<ChosenInlineResultUpdate> = () => undefined

    expectTypeOf<Parameters<typeof handler>[0]>().toMatchTypeOf<ChosenInlineResultUpdate>()
  })
})

describe('tg.action', () => {
  it('registers a handler scoped to the supplied service-event kind', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const handler = vi.fn()

    tg.action('new_chat_members', handler)

    await (tg as any).dispatch(newChatMembersUpdate())
    await (tg as any).dispatch(messageUpdate('hi'))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('handler infers as the matching service-event update type', () => {
    const handler: UpdateHandler<NewChatMembersUpdate> = () => undefined

    expectTypeOf<Parameters<typeof handler>[0]>().toMatchTypeOf<NewChatMembersUpdate>()
  })
})
