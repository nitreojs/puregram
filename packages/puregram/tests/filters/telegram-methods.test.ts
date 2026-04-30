import type { CallbackQueryUpdate, MessageUpdate } from '@puregram/api'
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

describe('tg.command regression after K.8 refactor', () => {
  it('matches /name and skips other text', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const seen: string[] = []
    const fellThrough: string[] = []

    tg.command('hello', (message) => {
      seen.push(message.raw.text!)
    })
    tg.onMessage((message) => {
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

describe('tg.callbackQuery', () => {
  it('registers a handler that fires on matching callback_query', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const handler = vi.fn()

    tg.callbackQuery('buy', handler)

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
