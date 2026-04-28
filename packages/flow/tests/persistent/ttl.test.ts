import { MemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { flow } from '../../src'
import type { PersistedFlow } from '../../src/persistent/types'
import { makeUpdate } from '../helpers/make-update'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

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
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow({ storage }))

    await t.start()

    ;(t as any).send = vi.fn().mockResolvedValue({ message_id: 1 })
    ;(t as any).flow.handle('age', { onAnswer: () => {} })

    await (t as any).flow.prompt(100, 'how old?', { id: 'age', from: 9, ttl: 5000 })

    expect((await storage.get('100:9:message'))!.expiresAt).toBe(6000)

    await t.shutdown()
  })

  it('defaultTtl falls back when ttl is omitted', async () => {
    vi.setSystemTime(new Date(1000))

    const storage = new MemoryStorage<PersistedFlow>()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow({ storage, defaultTtl: 10_000 }))

    await t.start()

    ;(t as any).send = vi.fn().mockResolvedValue({ message_id: 1 })
    ;(t as any).flow.handle('age', { onAnswer: () => {} })

    await (t as any).flow.prompt(100, 'how old?', { id: 'age', from: 9 })

    expect((await storage.get('100:9:message'))!.expiresAt).toBe(11000)

    await t.shutdown()
  })

  it('expired record runs onTimeout, deletes itself, propagates next', async () => {
    vi.setSystemTime(new Date(1000))

    const storage = new MemoryStorage<PersistedFlow>()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow({ storage }))

    await t.start()

    ;(t as any).send = vi.fn().mockResolvedValue({ message_id: 1 })

    const onTimeout = vi.fn()

    ;(t as any).flow.handle('age', { onAnswer: () => {}, onTimeout })

    await (t as any).flow.prompt(100, 'how old?', { id: 'age', from: 9, ttl: 5000 })

    vi.setSystemTime(new Date(20_000))

    const userHandler = vi.fn()

    ;(t as any).on('message', userHandler)

    await (t as any).dispatch(makeUpdate('message', { chat: { id: 100 }, from: { id: 9 }, text: 'late' }))

    expect(onTimeout).toHaveBeenCalledOnce()
    expect(await storage.has('100:9:message')).toBe(false)
    expect(userHandler).toHaveBeenCalledOnce()

    await t.shutdown()
  })

  it('no ttl + no defaultTtl = no expiresAt', async () => {
    vi.setSystemTime(new Date(1000))

    const storage = new MemoryStorage<PersistedFlow>()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow({ storage }))

    await t.start()

    ;(t as any).send = vi.fn().mockResolvedValue({ message_id: 1 })
    ;(t as any).flow.handle('age', { onAnswer: () => {} })

    await (t as any).flow.prompt(100, 'how old?', { id: 'age', from: 9 })

    expect((await storage.get('100:9:message'))!.expiresAt).toBeUndefined()

    await t.shutdown()
  })
})
