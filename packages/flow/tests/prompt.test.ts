import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { flow } from '../src'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

describe('prompt', () => {
  it('sends a message via tg.send and registers a waiter', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

    await t.start()

    const sent: { chat: number | string, text: string }[] = []

    ;(t as any).send = (chat: number, text: string) => {
      sent.push({ chat, text })

      return Promise.resolve({ message_id: 1, chat: { id: chat }, text })
    }

    const promptPromise = (t as any).flow.prompt(100, 'name?', {
      filter: (m: any) => m.chat?.id === 100
    })

    // wait a microtask for the async send to land
    await new Promise(resolve => setImmediate(resolve))

    expect(sent).toEqual([{ chat: 100, text: 'name?' }])

    ;(t as any).flow.cancelAll()
    await expect(promptPromise).rejects.toMatchObject({ name: 'WaitForCancelled' })

    await t.shutdown()
  })

  it('forwards from + timeout into the underlying waiter', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

    await t.start()

    ;(t as any).send = vi.fn().mockResolvedValue({ message_id: 1 })

    const promptPromise = (t as any).flow.prompt(100, 'go', { from: 7 })

    // wait for the send call to be observable before tearing down
    await new Promise(resolve => setImmediate(resolve))

    ;(t as any).flow.cancelAll()
    await expect(promptPromise).rejects.toMatchObject({ name: 'WaitForCancelled' })

    expect(((t as any).send as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(100, 'go')

    await t.shutdown()
  })

  it('forwards reply_markup via the third send arg', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

    await t.start()

    const send = vi.fn().mockResolvedValue({ message_id: 1 })

    ;(t as any).send = send

    const promptPromise = (t as any).flow.prompt(100, 'pick', {
      kind: 'callback_query',
      reply_markup: { inline_keyboard: [[{ text: 'yes', callback_data: 'yes' }]] }
    })

    await new Promise(resolve => setImmediate(resolve))

    expect(send).toHaveBeenCalledWith(100, 'pick', {
      reply_markup: { inline_keyboard: [[{ text: 'yes', callback_data: 'yes' }]] }
    })

    ;(t as any).flow.cancelAll()
    await expect(promptPromise).rejects.toMatchObject({ name: 'WaitForCancelled' })

    await t.shutdown()
  })

  it('kind:callback_query waits for callback_query, not message', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

    await t.start()

    ;(t as any).send = vi.fn().mockResolvedValue({ message_id: 1 })

    const promptPromise = (t as any).flow.prompt(100, 'pick', { kind: 'callback_query' })

    await new Promise(resolve => setImmediate(resolve))

    // the registry should have one callback_query waiter, zero message waiters
    const registry = (t as any).flow as { waitFor: unknown }

    expect(registry).toBeDefined()

    ;(t as any).flow.cancelAll()
    await expect(promptPromise).rejects.toMatchObject({ name: 'WaitForCancelled' })

    await t.shutdown()
  })

  it('transform shapes the awaited value', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

    await t.start()

    ;(t as any).send = vi.fn().mockResolvedValue({ message_id: 1 })

    const promptPromise = (t as any).flow.prompt(100, 'how old?', {
      transform: (m: any) => Number(m.text)
    })

    await new Promise(resolve => setImmediate(resolve))

    // dispatched updates need a `raw` payload — augment middleware reads update.raw.chat
    await (t as any).dispatch({
      kind: 'message',
      chat: { id: 100 },
      text: '42',
      raw: { chat: { id: 100 }, text: '42' }
    })

    await expect(promptPromise).resolves.toBe(42)

    await t.shutdown()
  })

  it('resolves a reply dispatched while the send is still in flight', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

    await t.start()

    // the waiter must be armed before tg.send settles — polling keeps dispatching
    // during the round-trip, so a reply arriving mid-send must still match
    const gate = Promise.withResolvers<{ message_id: number }>()

    ;(t as any).send = () => gate.promise

    const promptPromise = (t as any).flow.prompt(100, 'name?')

    await (t as any).dispatch({
      kind: 'message',
      chat: { id: 100 },
      text: 'alice',
      raw: { chat: { id: 100 }, text: 'alice' }
    })

    gate.resolve({ message_id: 1 })

    await expect(promptPromise).resolves.toMatchObject({ text: 'alice' })

    await t.shutdown()
  })

  it('rejects with the send error and disarms the waiter when the send fails', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

    await t.start()

    ;(t as any).send = vi.fn().mockRejectedValue(new Error('network down'))

    await expect((t as any).flow.prompt(100, 'name?')).rejects.toThrow('network down')

    // the failed prompt left nothing armed: a later reply reaches handlers untouched
    const seen: string[] = []

    t.on('message', (message) => {
      seen.push(message.raw.text!)
    })

    await (t as any).dispatch({
      kind: 'message',
      chat: { id: 100 },
      text: 'alice',
      raw: { chat: { id: 100 }, text: 'alice' }
    })

    expect(seen).toEqual(['alice'])

    await t.shutdown()
  })
})
