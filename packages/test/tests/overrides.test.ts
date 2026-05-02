import { describe, expect, it } from 'vitest'

import { apiError } from '../src/stubs/api-error'
import { OverrideRegistry } from '../src/stubs/overrides'

describe('OverrideRegistry', () => {
  it('returns undefined when no override registered', async () => {
    const reg = new OverrideRegistry()

    await expect(reg.resolve('sendMessage', { chat_id: 1, text: 'hi' })).resolves.toEqual({ kind: 'fall-through' })
  })

  it('returns a static reply', async () => {
    const reg = new OverrideRegistry()
    const reply = { message_id: 1, date: 0, chat: { id: 1, type: 'private' }, text: 'forced' }

    reg.set('sendMessage', reply)

    const r = await reg.resolve('sendMessage', { chat_id: 1, text: 'hi' })

    expect(r).toEqual({ kind: 'reply', value: reply, mutateWorld: true })
  })

  it('runs a function override and returns its bare result', async () => {
    const reg = new OverrideRegistry()

    reg.set('sendMessage', (params: { text?: string }) => ({
      message_id: 7,
      date: 0,
      chat: { id: 1, type: 'private' },
      text: params.text
    }))

    const r = await reg.resolve('sendMessage', { chat_id: 1, text: 'yo' })

    expect(r).toEqual({
      kind: 'reply',
      value: { message_id: 7, date: 0, chat: { id: 1, type: 'private' }, text: 'yo' },
      mutateWorld: true
    })
  })

  it('falls through when fn returns undefined', async () => {
    const reg = new OverrideRegistry()

    reg.set('sendMessage', () => undefined)

    await expect(reg.resolve('sendMessage', {})).resolves.toEqual({ kind: 'fall-through' })
  })

  it('forwards apiError sentinels', async () => {
    const reg = new OverrideRegistry()

    reg.set('sendMessage', apiError(429, 'rate'))

    const r = await reg.resolve('sendMessage', {})

    expect(r.kind).toBe('error')

    if (r.kind === 'error') {
      expect(r.value.error_code).toBe(429)
    }
  })

  it('handles arrays sequentially then falls through', async () => {
    const reg = new OverrideRegistry()

    reg.set('sendMessage', [
      apiError(429, 'first'),
      { message_id: 1, date: 0, chat: { id: 1, type: 'private' }, text: 'ok' }
    ])

    const a = await reg.resolve('sendMessage', {})

    expect(a.kind).toBe('error')

    const b = await reg.resolve('sendMessage', {})

    expect(b.kind).toBe('reply')

    const c = await reg.resolve('sendMessage', {})

    expect(c.kind).toBe('fall-through')
  })

  it('respects { times } and falls through afterwards', async () => {
    const reg = new OverrideRegistry()

    reg.set('sendMessage', apiError(429, 'rate'), { times: 1 })

    expect((await reg.resolve('sendMessage', {})).kind).toBe('error')
    expect((await reg.resolve('sendMessage', {})).kind).toBe('fall-through')
  })

  it('respects { mutateWorld: false } on the resolved reply', async () => {
    const reg = new OverrideRegistry()
    const reply = { message_id: 1, date: 0, chat: { id: 1, type: 'private' }, text: 'forced' }

    reg.set('sendMessage', reply, { mutateWorld: false })

    const r = await reg.resolve('sendMessage', {})

    if (r.kind === 'reply') {
      expect(r.mutateWorld).toBe(false)
    }
  })

  it('clears one method or all', () => {
    const reg = new OverrideRegistry()

    reg.set('sendMessage', { x: 1 } as never)
    reg.set('getMe', { x: 2 } as never)

    reg.clear('sendMessage')
    expect(reg.has('sendMessage')).toBe(false)
    expect(reg.has('getMe')).toBe(true)

    reg.clear()
    expect(reg.has('getMe')).toBe(false)
  })
})
