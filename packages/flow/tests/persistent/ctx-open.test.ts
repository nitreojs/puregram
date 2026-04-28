import { MemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { flow } from '../../src'
import type { PersistedFlow } from '../../src/persistent/types'
import { makeUpdate } from '../helpers/make-update'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

describe('ctx.open chains the next persistent prompt', () => {
  it('register:name -> ctx.open(register:age) -> register:age handles the next message', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow({ storage }))

    await t.start()

    ;(t as any).send = vi.fn().mockResolvedValue({ message_id: 1 })

    const onAge = vi.fn()

    ;(t as any).flow.handle('register:name', {
      transform: (m: any) => m.text,
      onAnswer: async (name: string, ctx: any) => {
        await ctx.open('register:age', { text: 'how old?', payload: { name } })
      }
    })

    ;(t as any).flow.handle('register:age', {
      transform: (m: any) => Number(m.text),
      onAnswer: onAge
    })

    await (t as any).flow.prompt(100, 'name?', { id: 'register:name', from: 9 })

    await (t as any).dispatch(makeUpdate('message', { chat: { id: 100 }, from: { id: 9 }, text: 'alice' }))

    // record for register:age must now exist
    expect(await storage.has('100:9:message')).toBe(true)

    await (t as any).dispatch(makeUpdate('message', { chat: { id: 100 }, from: { id: 9 }, text: '42' }))

    expect(onAge).toHaveBeenCalledOnce()
    expect(onAge.mock.calls[0]![0]).toBe(42)
    expect(onAge.mock.calls[0]![1].payload).toEqual({ name: 'alice' })

    await t.shutdown()
  })
})
