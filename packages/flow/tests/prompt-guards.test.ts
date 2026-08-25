import { MemoryStorage } from '@puregram/storage'
import { describe, expect, it, vi } from 'vitest'

import { flow, FlowChatIdNotNumeric } from '../src'
import type { PersistedFlow } from '../src/persistent/types'

import { makeTg } from './helpers/make-tg'

describe('flow.prompt — input guards', () => {
  it('rejects a non-numeric chat id instead of building an unmatchable waiter', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()))

    await tg.start()

    await expect(tg.flow.prompt('@channel', 'name?')).rejects.toThrow(FlowChatIdNotNumeric)

    await mock.stop()
  })

  it('forwards signal to the waiter so an abort settles the prompt', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()))

    mock.expect('sendMessage', (params: Record<string, unknown>) => ({
      ok: true,
      result: { message_id: 99, date: 0, chat: { id: params.chat_id, type: 'private' }, text: params.text }
    }))

    await tg.start()

    const controller = new AbortController()
    const pending = tg.flow.prompt(100, 'name?', { signal: controller.signal })

    controller.abort()

    await expect(pending).rejects.toThrow()

    await mock.stop()
  })
})

describe('persistent flow.prompt — record armed before the send', () => {
  it('has the record on disk by the time the send resolves', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const { tg, mock } = await makeTg(t => t.extend(flow({ storage })))

    let armedDuringSend = false

    mock.expect('sendMessage', (params: Record<string, unknown>) => ({
      ok: true,
      result: { message_id: 99, date: 0, chat: { id: params.chat_id, type: 'private' }, text: params.text }
    }))

    await tg.start()

    tg.flow.handle('ask:name', { onAnswer: vi.fn() })

    tg.useHook('onBeforeRequest', async (ctx: { method: string }, next: () => Promise<void>) => {
      if (ctx.method === 'sendMessage') {
        armedDuringSend = (await storage.get('100:*:message')) !== undefined
      }

      await next()
    })

    await tg.flow.prompt(100, 'name?', { id: 'ask:name' })

    expect(armedDuringSend).toBe(true)

    await mock.stop()
  })

  it('removes the record when the send fails', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const { tg, mock } = await makeTg(t => t.extend(flow({ storage })))

    mock.expect('sendMessage', { ok: false, error_code: 403, description: 'blocked by user' })

    await tg.start()

    tg.flow.handle('ask:name', { onAnswer: vi.fn() })

    await expect(tg.flow.prompt(100, 'name?', { id: 'ask:name' })).rejects.toThrow()

    expect(await storage.get('100:*:message')).toBeUndefined()

    await mock.stop()
  })
})
