import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { flow } from '../src'

describe('prompt', () => {
  it('sends a message via tg.send and registers a waiter', async () => {
    const t = new Telegram({ token: 'TEST' }).extend(flow())

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
    const t = new Telegram({ token: 'TEST' }).extend(flow())

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
})
