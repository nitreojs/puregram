import { MemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { flow } from '../../src'
import type { PersistedFlow } from '../../src/persistent/types'
import { makeUpdate } from '../helpers/make-update'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

describe('persistent prompt round-trip', () => {
  it('writes a record on prompt, dispatches to handle on the matching update, deletes the record', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow({ storage }))

    await t.start()

    ;(t as any).send = vi.fn().mockResolvedValue({ message_id: 1 })

    const onAnswer = vi.fn()

    ;(t as any).flow.handle('register:name', {
      transform: (m: any) => m.text,
      onAnswer
    })

    await (t as any).flow.prompt(100, 'what is your name?', { id: 'register:name', from: 9 })

    expect(await storage.has('100:9:message')).toBe(true)

    await (t as any).dispatch(makeUpdate('message', { chat: { id: 100 }, from: { id: 9 }, text: 'alice' }))

    expect(onAnswer).toHaveBeenCalledOnce()
    expect(onAnswer.mock.calls[0]![0]).toBe('alice')
    expect(await storage.has('100:9:message')).toBe(false)

    await t.shutdown()
  })

  it('survives a simulated restart: pre-write a record, spin a fresh tg with the same storage and handle', async () => {
    const storage = new MemoryStorage<PersistedFlow>()

    // simulate the previous process having written a record before crashing
    await storage.set('100:9:message', {
      id: 'register:name',
      kind: 'message',
      chatId: 100,
      fromId: 9,
      payload: undefined,
      createdAt: Date.now()
    })

    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow({ storage }))

    await t.start()

    const onAnswer = vi.fn()

    ;(t as any).flow.handle('register:name', { transform: (m: any) => m.text, onAnswer })

    await (t as any).dispatch(makeUpdate('message', { chat: { id: 100 }, from: { id: 9 }, text: 'alice' }))

    expect(onAnswer).toHaveBeenCalledOnce()
    expect(onAnswer.mock.calls[0]![0]).toBe('alice')
    expect(await storage.has('100:9:message')).toBe(false)

    await t.shutdown()
  })
})
