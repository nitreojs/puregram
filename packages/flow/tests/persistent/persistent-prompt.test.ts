import { MemoryStorage } from '@puregram/storage'
import type { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { flow } from '../../src'
import type { PersistedFlow } from '../../src/persistent/types'
import { makeTg } from '../helpers/make-tg'
import { makeUpdate } from '../helpers/make-update'

// `dispatch` is protected on Telegram; tests that push synthetic updates use this typed escape
const dispatchOf = (tg: Telegram) =>
  (tg as unknown as { dispatch: (u: unknown) => Promise<void> }).dispatch.bind(tg)

describe('persistent prompt round-trip', () => {
  it('writes a record on prompt, dispatches to handle on the matching update, deletes the record', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const { tg, mock } = await makeTg(t => t.extend(flow({ storage })))

    await tg.start()

    ;(tg as { send: unknown }).send = vi.fn().mockResolvedValue({ message_id: 1 })

    const onAnswer = vi.fn()

    tg.flow.handle('register:name', {
      transform: m => m.text!,
      onAnswer
    })

    await tg.flow.prompt(100, 'what is your name?', { id: 'register:name', from: 9 })

    expect(await storage.has('100:9:message')).toBe(true)

    await dispatchOf(tg)(makeUpdate('message', { chat: { id: 100 }, from: { id: 9 }, text: 'alice' }))

    expect(onAnswer).toHaveBeenCalledOnce()
    expect(onAnswer.mock.calls[0]![0]).toBe('alice')
    expect(await storage.has('100:9:message')).toBe(false)

    await tg.shutdown()
    await mock.stop()
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

    const { tg, mock } = await makeTg(t => t.extend(flow({ storage })))

    await tg.start()

    const onAnswer = vi.fn()

    tg.flow.handle('register:name', { transform: m => m.text!, onAnswer })

    await dispatchOf(tg)(makeUpdate('message', { chat: { id: 100 }, from: { id: 9 }, text: 'alice' }))

    expect(onAnswer).toHaveBeenCalledOnce()
    expect(onAnswer.mock.calls[0]![0]).toBe('alice')
    expect(await storage.has('100:9:message')).toBe(false)

    await tg.shutdown()
    await mock.stop()
  })
})
