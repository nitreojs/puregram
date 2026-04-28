import { MemoryStorage } from '@puregram/storage'
import type { Telegram } from 'puregram'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { flow } from '../../src'
import type { PersistedFlow } from '../../src/persistent/types'
import { makeTg } from '../helpers/make-tg'
import { makeUpdate } from '../helpers/make-update'

const dispatchOf = (tg: Telegram) =>
  (tg as unknown as { dispatch: (u: unknown) => Promise<void> }).dispatch.bind(tg)

describe('persistent ttl', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('per-call ttl writes expiresAt', async () => {
    vi.setSystemTime(new Date(1000))

    const storage = new MemoryStorage<PersistedFlow>()
    const { tg, mock } = await makeTg(t => t.extend(flow({ storage })))

    await tg.start()

    ;(tg as { send: unknown }).send = vi.fn().mockResolvedValue({ message_id: 1 })

    tg.flow.handle('age', { onAnswer: () => {} })

    await tg.flow.prompt(100, 'how old?', { id: 'age', from: 9, ttl: 5000 })

    expect((await storage.get('100:9:message'))!.expiresAt).toBe(6000)

    await tg.shutdown()
    await mock.stop()
  })

  it('defaultTtl falls back when ttl is omitted', async () => {
    vi.setSystemTime(new Date(1000))

    const storage = new MemoryStorage<PersistedFlow>()
    const { tg, mock } = await makeTg(t => t.extend(flow({ storage, defaultTtl: 10_000 })))

    await tg.start()

    ;(tg as { send: unknown }).send = vi.fn().mockResolvedValue({ message_id: 1 })

    tg.flow.handle('age', { onAnswer: () => {} })

    await tg.flow.prompt(100, 'how old?', { id: 'age', from: 9 })

    expect((await storage.get('100:9:message'))!.expiresAt).toBe(11000)

    await tg.shutdown()
    await mock.stop()
  })

  it('expired record runs onTimeout, deletes itself, propagates next', async () => {
    vi.setSystemTime(new Date(1000))

    const storage = new MemoryStorage<PersistedFlow>()
    const { tg, mock } = await makeTg(t => t.extend(flow({ storage })))

    await tg.start()

    ;(tg as { send: unknown }).send = vi.fn().mockResolvedValue({ message_id: 1 })

    const onTimeout = vi.fn()

    tg.flow.handle('age', { onAnswer: () => {}, onTimeout })

    await tg.flow.prompt(100, 'how old?', { id: 'age', from: 9, ttl: 5000 })

    vi.setSystemTime(new Date(20_000))

    const userHandler = vi.fn()

    tg.on('message', userHandler)

    await dispatchOf(tg)(makeUpdate('message', { chat: { id: 100 }, from: { id: 9 }, text: 'late' }))

    expect(onTimeout).toHaveBeenCalledOnce()
    expect(await storage.has('100:9:message')).toBe(false)
    expect(userHandler).toHaveBeenCalledOnce()

    await tg.shutdown()
    await mock.stop()
  })

  it('no ttl + no defaultTtl = no expiresAt', async () => {
    vi.setSystemTime(new Date(1000))

    const storage = new MemoryStorage<PersistedFlow>()
    const { tg, mock } = await makeTg(t => t.extend(flow({ storage })))

    await tg.start()

    ;(tg as { send: unknown }).send = vi.fn().mockResolvedValue({ message_id: 1 })

    tg.flow.handle('age', { onAnswer: () => {} })

    await tg.flow.prompt(100, 'how old?', { id: 'age', from: 9 })

    expect((await storage.get('100:9:message'))!.expiresAt).toBeUndefined()

    await tg.shutdown()
    await mock.stop()
  })
})
