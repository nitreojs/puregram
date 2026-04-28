import { MemoryStorage } from '@puregram/storage'
import type { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { HandlerRegistry } from '../../src/persistent/handlers'
import { createPersistentMiddleware } from '../../src/persistent/middleware'
import { writeRecord } from '../../src/persistent/persist'
import type { PersistedFlow } from '../../src/persistent/types'

const fakeTg = (send = vi.fn(() => Promise.resolve({}))) =>
  ({ send } as unknown as Telegram)

describe('createPersistentMiddleware', () => {
  it('matches a persisted record, calls onAnswer, deletes the record, consumes the update', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const handlers = new HandlerRegistry()
    const onAnswer = vi.fn()

    handlers.register('register:name', { onAnswer })

    await writeRecord(storage, {
      id: 'register:name',
      kind: 'message',
      chatId: 100,
      fromId: 9,
      payload: undefined,
      createdAt: Date.now()
    })

    const mw = createPersistentMiddleware({
      storage,
      handlers,
      tg: fakeTg(),
      defaultTtl: undefined
    })
    const next = vi.fn(() => Promise.resolve())
    const update = { kind: 'message', chat: { id: 100 }, from: { id: 9 }, text: 'alice' } as any

    await mw(update, next)

    expect(onAnswer).toHaveBeenCalledOnce()
    expect(await storage.has('100:9:message')).toBe(false)
    expect(next).not.toHaveBeenCalled()
  })

  it('passes through when no record exists for the (chat, user, kind) triple', async () => {
    const mw = createPersistentMiddleware({
      storage: new MemoryStorage<PersistedFlow>(),
      handlers: new HandlerRegistry(),
      tg: fakeTg(),
      defaultTtl: undefined
    })
    const next = vi.fn(() => Promise.resolve())

    await mw({ kind: 'message', chat: { id: 1 }, from: { id: 2 } } as any, next)

    expect(next).toHaveBeenCalledOnce()
  })

  it('falls back to fromId=undefined record when the keyed-by-fromId record is absent', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const handlers = new HandlerRegistry()
    const onAnswer = vi.fn()

    handlers.register('open:any', { onAnswer })

    await writeRecord(storage, {
      id: 'open:any',
      kind: 'message',
      chatId: 100,
      fromId: undefined,
      payload: undefined,
      createdAt: Date.now()
    })

    const mw = createPersistentMiddleware({
      storage,
      handlers,
      tg: fakeTg(),
      defaultTtl: undefined
    })
    const next = vi.fn(() => Promise.resolve())

    await mw({ kind: 'message', chat: { id: 100 }, from: { id: 7 } } as any, next)

    expect(onAnswer).toHaveBeenCalledOnce()
  })

  it('throws FlowHandlerMissing when a record matches but no handler is registered', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const handlers = new HandlerRegistry()

    await writeRecord(storage, {
      id: 'unknown',
      kind: 'message',
      chatId: 100,
      fromId: undefined,
      payload: undefined,
      createdAt: Date.now()
    })

    const mw = createPersistentMiddleware({
      storage,
      handlers,
      tg: fakeTg(),
      defaultTtl: undefined
    })

    await expect(mw({ kind: 'message', chat: { id: 100 } } as any, () => Promise.resolve())).rejects.toMatchObject({
      name: 'FlowHandlerMissing',
      id: 'unknown'
    })

    // record kept so a later boot with the handler can resume
    expect(await storage.has('100:*:message')).toBe(true)
  })

  it('on validate-string feedback, sends the feedback, bumps attempts, keeps the record', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const handlers = new HandlerRegistry()

    handlers.register('age', {
      validate: () => 'must be a number',
      onAnswer: () => {}
    })

    await writeRecord(storage, {
      id: 'age',
      kind: 'message',
      chatId: 100,
      fromId: 9,
      payload: undefined,
      createdAt: Date.now()
    })

    const send = vi.fn(() => Promise.resolve({}))
    const mw = createPersistentMiddleware({
      storage,
      handlers,
      tg: fakeTg(send),
      defaultTtl: undefined
    })

    await mw(
      { kind: 'message', chat: { id: 100 }, from: { id: 9 }, text: 'oops' } as any,
      () => Promise.resolve()
    )

    expect(send).toHaveBeenCalledWith(100, 'must be a number')
    expect((await storage.get('100:9:message'))!.attempts).toBe(1)
  })

  it('expired record fires onTimeout (if registered), deletes the record, and propagates next', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const handlers = new HandlerRegistry()
    const onTimeout = vi.fn()

    handlers.register('age', { onAnswer: () => {}, onTimeout })

    await writeRecord(storage, {
      id: 'age',
      kind: 'message',
      chatId: 100,
      fromId: 9,
      payload: undefined,
      createdAt: 0,
      expiresAt: 1000
    })

    const mw = createPersistentMiddleware({
      storage,
      handlers,
      tg: fakeTg(),
      defaultTtl: undefined,
      now: () => 5000
    })
    const next = vi.fn(() => Promise.resolve())

    await mw({ kind: 'message', chat: { id: 100 }, from: { id: 9 }, text: 'late' } as any, next)

    expect(onTimeout).toHaveBeenCalledOnce()
    expect(await storage.has('100:9:message')).toBe(false)
    expect(next).toHaveBeenCalledOnce()
  })
})
