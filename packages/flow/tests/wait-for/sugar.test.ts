import { Telegram } from 'puregram'
import { describe, expect, it } from 'vitest'

import { flow } from '../../src'
import {
  buildCommandFilter,
  composeCallbackPredicate,
  composeMessageFilter
} from '../../src/wait-for/sugar'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

const tg = async () => {
  const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

  await t.start()
  t.defineUpdate('message')
  t.defineUpdate('callback_query')

  return t
}

describe('buildCommandFilter', () => {
  it('matches `/name` exactly', () => {
    const f = buildCommandFilter('start')

    expect(f({ text: '/start' } as any)).toBe(true)
    expect(f({ text: '/start@botname' } as any)).toBe(true)
    expect(f({ text: '/start hello world' } as any)).toBe(true)
  })

  it('rejects non-matching commands', () => {
    const f = buildCommandFilter('start')

    expect(f({ text: '/stop' } as any)).toBe(false)
    expect(f({ text: 'start' } as any)).toBe(false)
    expect(f({ text: '/started' } as any)).toBe(false)
    expect(f({ text: undefined } as any)).toBe(false)
  })

  it('accepts a leading slash in the name argument', () => {
    const f = buildCommandFilter('/help')

    expect(f({ text: '/help' } as any)).toBe(true)
  })

  it('uses regex form when given a RegExp', () => {
    const f = buildCommandFilter(/^\/cancel(?:ed)?$/)

    expect(f({ text: '/cancel' } as any)).toBe(true)
    expect(f({ text: '/canceled' } as any)).toBe(true)
    expect(f({ text: '/cancelnow' } as any)).toBe(false)
  })

  it('falls back to caption when text is absent', () => {
    const f = buildCommandFilter('caption')

    expect(f({ text: undefined, caption: '/caption hi' } as any)).toBe(true)
  })
})

describe('composeCallbackPredicate', () => {
  it('AND-composes both predicates when both supplied', () => {
    const f = composeCallbackPredicate(
      (q: any) => q.data === 'yes',
      (q: any) => q.id === 'q1'
    )

    expect(f).toBeDefined()
    expect(f!({ data: 'yes', id: 'q1' } as any)).toBe(true)
    expect(f!({ data: 'no', id: 'q1' } as any)).toBe(false)
    expect(f!({ data: 'yes', id: 'q2' } as any)).toBe(false)
  })

  it('returns undefined when both are undefined', () => {
    expect(composeCallbackPredicate(undefined, undefined)).toBeUndefined()
  })
})

describe('composeMessageFilter', () => {
  it('AND-composes both', () => {
    const f = composeMessageFilter(
      (m: any) => m.text === 'a',
      (m: any) => m.from?.id === 1
    )

    expect(f({ text: 'a', from: { id: 1 } } as any)).toBe(true)
    expect(f({ text: 'b', from: { id: 1 } } as any)).toBe(false)
    expect(f({ text: 'a', from: { id: 2 } } as any)).toBe(false)
  })

  it('returns primary unchanged when extra is undefined', () => {
    const primary = (m: any) => m.text === 'a'

    expect(composeMessageFilter(primary, undefined)).toBe(primary)
  })
})

declare module '@puregram/api' {
  interface UpdateKindMap {
    callback_query: { kind: 'callback_query', data?: string, raw: any }
    message: { kind: 'message', text?: string, raw: any }
  }
}

describe('flow.waitForCallbackQuery', () => {
  it('resolves on next callback_query matching predicate', async () => {
    const t = await tg()

    const promise = (t as any).flow.waitForCallbackQuery((q: any) => q.data === 'yes')

    t.emit('callback_query', { data: 'no', raw: {} })
    await new Promise(resolve => setImmediate(resolve))

    t.emit('callback_query', { data: 'yes', raw: {} })
    await new Promise(resolve => setImmediate(resolve))

    await expect(promise).resolves.toMatchObject({ data: 'yes' })

    await t.shutdown()
  })

  it('resolves on any callback_query when no predicate supplied', async () => {
    const t = await tg()

    const promise = (t as any).flow.waitForCallbackQuery()

    t.emit('callback_query', { data: 'anything', raw: {} })
    await new Promise(resolve => setImmediate(resolve))

    await expect(promise).resolves.toMatchObject({ data: 'anything' })

    await t.shutdown()
  })
})

describe('flow.waitForCommand', () => {
  it('resolves on /name message', async () => {
    const t = await tg()

    const promise = (t as any).flow.waitForCommand('start')

    t.emit('message', { text: '/help', raw: {} })
    await new Promise(resolve => setImmediate(resolve))

    t.emit('message', { text: '/start go', raw: {} })
    await new Promise(resolve => setImmediate(resolve))

    await expect(promise).resolves.toMatchObject({ text: '/start go' })

    await t.shutdown()
  })

  it('resolves on regex match', async () => {
    const t = await tg()

    const promise = (t as any).flow.waitForCommand(/^\/(yes|no)$/)

    t.emit('message', { text: '/maybe', raw: {} })
    await new Promise(resolve => setImmediate(resolve))

    t.emit('message', { text: '/yes', raw: {} })
    await new Promise(resolve => setImmediate(resolve))

    await expect(promise).resolves.toMatchObject({ text: '/yes' })

    await t.shutdown()
  })

  it('honors signal option', async () => {
    const t = await tg()

    const controller = new AbortController()
    const promise = (t as any).flow.waitForCommand('start', { signal: controller.signal })

    controller.abort()
    await expect(promise).rejects.toMatchObject({ name: 'WaiterAbortedError' })

    await t.shutdown()
  })
})

describe('flow.waitForCallbackQuery secondary filter', () => {
  it('AND-composes predicate with options.filter', async () => {
    const t = await tg()

    const promise = (t as any).flow.waitForCallbackQuery(
      (q: any) => q.data === 'go',
      { filter: (q: any) => q.tag === 'right' }
    )

    t.emit('callback_query', { data: 'go', tag: 'wrong', raw: {} })
    await new Promise(resolve => setImmediate(resolve))

    t.emit('callback_query', { data: 'go', tag: 'right', raw: {} })
    await new Promise(resolve => setImmediate(resolve))

    await expect(promise).resolves.toMatchObject({ data: 'go', tag: 'right' })

    await t.shutdown()
  })
})
