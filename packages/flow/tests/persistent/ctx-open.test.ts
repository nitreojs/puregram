import { MemoryStorage } from '@puregram/storage'
import type { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { flow } from '../../src'
import type { PersistedFlow } from '../../src/persistent/types'
import { makeTg } from '../helpers/make-tg'
import { makeUpdate } from '../helpers/make-update'

const dispatchOf = (tg: Telegram) =>
  (tg as unknown as { dispatch: (u: unknown) => Promise<void> }).dispatch.bind(tg)

describe('ctx.open chains the next persistent prompt', () => {
  it('register:name -> ctx.open(register:age) -> register:age handles the next message', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const { tg, mock } = await makeTg(t => t.extend(flow({ storage })))

    await tg.start()

    ;(tg as { send: unknown }).send = vi.fn().mockResolvedValue({ message_id: 1 })

    const onAge = vi.fn()

    tg.flow.handle('register:name', {
      transform: m => m.text!,
      onAnswer: async (name, ctx) => {
        await ctx.open('register:age', { text: 'how old?', payload: { name } })
      }
    })

    tg.flow.handle('register:age', {
      transform: m => Number(m.text),
      onAnswer: onAge
    })

    await tg.flow.prompt(100, 'name?', { id: 'register:name', from: 9 })

    await dispatchOf(tg)(makeUpdate('message', { chat: { id: 100 }, from: { id: 9 }, text: 'alice' }))

    // record for register:age must now exist
    expect(await storage.has('100:9:message')).toBe(true)

    await dispatchOf(tg)(makeUpdate('message', { chat: { id: 100 }, from: { id: 9 }, text: '42' }))

    expect(onAge).toHaveBeenCalledOnce()
    expect(onAge.mock.calls[0]![0]).toBe(42)
    expect(onAge.mock.calls[0]![1].payload).toEqual({ name: 'alice' })

    await tg.shutdown()
    await mock.stop()
  })
})
