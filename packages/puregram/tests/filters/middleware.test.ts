import { defineFilter } from '@puregram/api'
import { describe, expect, it, vi } from 'vitest'

import { when } from '../../src/filters/when'
import { Telegram } from '../../src/telegram'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

const messageUpdate = (text?: string) => ({
  kind: 'message',
  raw: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text }
})

const callbackUpdate = () => ({
  kind: 'callback_query',
  raw: { id: 'cb1', from: { id: 1, is_bot: false, first_name: 'x' }, chat_instance: 'ci', data: 'noop' }
})

const isMessage = defineFilter(
  'isMessage',
  (update: unknown): update is { kind: 'message' } =>
    typeof update === 'object' && update !== null && (update as { kind?: unknown }).kind === 'message',
  { kinds: ['message'] }
)

describe('tg.use(filter, mw) overload', () => {
  it('runs the middleware when the filter matches', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const mw = vi.fn(async (_update: unknown, next: () => Promise<void>) => {
      await next()
    })

    tg.use(isMessage, mw)

    await (tg as any).dispatch(messageUpdate('hi'))
    expect(mw).toHaveBeenCalledTimes(1)
  })

  it('skips the middleware when the filter rejects', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const mw = vi.fn(async (_update: unknown, next: () => Promise<void>) => {
      await next()
    })

    tg.use(isMessage, mw)

    await (tg as any).dispatch(callbackUpdate())
    expect(mw).not.toHaveBeenCalled()
  })

  it('keeps the bare 1-arg form working', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const mw = vi.fn(async (_update: unknown, next: () => Promise<void>) => {
      await next()
    })

    tg.use(mw)

    await (tg as any).dispatch(messageUpdate('hi'))
    await (tg as any).dispatch(callbackUpdate())
    expect(mw).toHaveBeenCalledTimes(2)
  })

  it('forwards HookOptions in the 3-arg form', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const trace: string[] = []

    tg.use(isMessage, async (_update, next) => {
      trace.push('high')
      await next()
    }, { priority: 'high' })

    tg.use(async (_update, next) => {
      trace.push('normal')
      await next()
    })

    await (tg as any).dispatch(messageUpdate('hi'))
    expect(trace).toEqual(['high', 'normal'])
  })
})

describe('when(filter, mw) standalone', () => {
  it('runs the middleware when the filter matches', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const mw = vi.fn(async (_update: unknown, next: () => Promise<void>) => {
      await next()
    })

    tg.useHook('onUpdate', when(isMessage, mw))

    await (tg as any).dispatch(messageUpdate('hi'))
    expect(mw).toHaveBeenCalledTimes(1)
  })

  it('passes through when the filter does not match', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const mw = vi.fn(async (_update: unknown, next: () => Promise<void>) => {
      await next()
    })

    const after = vi.fn(async (_update: unknown, next: () => Promise<void>) => {
      await next()
    })

    tg.useHook('onUpdate', when(isMessage, mw))
    tg.use(after)

    await (tg as any).dispatch(callbackUpdate())
    expect(mw).not.toHaveBeenCalled()
    expect(after).toHaveBeenCalledTimes(1)
  })

  it('skips predicate eval via kinds-fast-path when kind does not match', async () => {
    const predicate = vi.fn((update: unknown): update is { kind: 'message' } =>
      typeof update === 'object' && update !== null && (update as { kind?: unknown }).kind === 'message'
    )

    const filter = defineFilter('messageOnly', predicate, { kinds: ['message'] })

    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const mw = vi.fn(async (_update: unknown, next: () => Promise<void>) => {
      await next()
    })

    tg.useHook('onUpdate', when(filter, mw))

    await (tg as any).dispatch(callbackUpdate())
    expect(predicate).not.toHaveBeenCalled()
    expect(mw).not.toHaveBeenCalled()

    await (tg as any).dispatch(messageUpdate('hi'))
    expect(predicate).toHaveBeenCalledTimes(1)
    expect(mw).toHaveBeenCalledTimes(1)
  })
})
