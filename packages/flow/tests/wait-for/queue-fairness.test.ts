import { describe, expect, it, vi } from 'vitest'

import { createWaitForMiddleware } from '../../src/wait-for/middleware'
import { WaiterRegistry } from '../../src/wait-for/registry'
import { Waiter } from '../../src/wait-for/waiter'

function messageFor (chatId: number, text: string) {
  return {
    kind: 'message',
    raw: { text, chat: { id: chatId } },
    chat: { id: chatId }
  } as never
}

describe('WaiterRegistry — queue fairness', () => {
  it('matches a waiter behind an unmatchable head', () => {
    const registry = new WaiterRegistry()

    const alice = new Waiter<'message'>('message', {
      filter: (u) => (u as unknown as { chat: { id: number } }).chat.id === 1
    })
    const bob = new Waiter<'message'>('message', {
      filter: (u) => (u as unknown as { chat: { id: number } }).chat.id === 2
    })

    registry.register(alice)
    registry.register(bob)

    const outcome = registry.matchOrPeek('message', messageFor(2, 'bob replies'))

    expect(outcome.outcome).toBe('matched')
    expect(outcome.outcome === 'matched' && outcome.waiter).toBe(bob)
  })

  it('does not leak one chat\'s validate feedback into another chat', async () => {
    const registry = new WaiterRegistry()
    const tg = { send: vi.fn(() => Promise.resolve(undefined)) }
    const middleware = createWaitForMiddleware(registry, tg as never)

    const alice = new Waiter<'message'>('message', {
      filter: (u) => (u as unknown as { chat: { id: number } }).chat.id === 1,
      validate: (u) => /^\d+$/.test((u as unknown as { raw: { text: string } }).raw.text) || 'digits only'
    })

    registry.register(alice)

    await middleware(messageFor(1, 'not a number'), () => Promise.resolve())

    expect(tg.send).toHaveBeenCalledWith(1, 'digits only')

    tg.send.mockClear()

    await middleware(messageFor(2, 'hello'), () => Promise.resolve())

    expect(tg.send).not.toHaveBeenCalled()
  })
})
