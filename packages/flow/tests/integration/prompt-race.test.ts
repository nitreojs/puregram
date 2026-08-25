import { describe, expect, it } from 'vitest'

import { flow } from '../../src'
import { makeTg } from '../helpers/make-tg'
import { waitUntil } from '../helpers/wait-until'

describe('@puregram/flow — prompt registration race', () => {
  it('does not drop a reply that lands while the prompt send is still in flight', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()))

    mock.expect('sendMessage', (params: Record<string, unknown>) => ({
      ok: true,
      result: { message_id: 99, date: 0, chat: { id: params.chat_id, type: 'private' }, text: params.text }
    }))

    let pulls = 0

    mock.expect('getUpdates', () => {
      pulls++

      if (pulls === 1) {
        return {
          ok: true,
          result: [
            { update_id: 1, message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text: '/ask' } }
          ]
        }
      }

      if (pulls === 2) {
        return {
          ok: true,
          result: [
            { update_id: 2, message: { message_id: 2, date: 0, chat: { id: 100, type: 'private' }, text: 'alice' } }
          ]
        }
      }

      return { ok: true, result: [] }
    })

    tg.useHook('onBeforeRequest', async (ctx: { method: string }, next: () => Promise<void>) => {
      if (ctx.method === 'sendMessage') {
        await new Promise<void>(resolve => setTimeout(resolve, 150))
      }

      await next()
    })

    let resolvedReply: { raw: { text: string } } | null = null

    tg.on('message', async (msg) => {
      if (msg.raw.text !== '/ask') {
        return
      }

      resolvedReply = await tg.flow.prompt(msg.raw.chat.id, 'name?') as { raw: { text: string } } | null
    })

    await tg.start()

    tg.startPolling().catch(() => {})

    await waitUntil(() => resolvedReply !== null, 3000)

    tg.stopPolling()

    expect(resolvedReply).not.toBeNull()
    expect(resolvedReply!.raw.text).toBe('alice')

    await mock.stop()
  })

  it('starts the reply timeout only once the question is delivered', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()))

    let delivered = false

    mock.expect('sendMessage', (params: Record<string, unknown>) => ({
      ok: true,
      result: { message_id: 99, date: 0, chat: { id: params.chat_id, type: 'private' }, text: params.text }
    }))

    let pulls = 0

    mock.expect('getUpdates', () => {
      pulls++

      if (pulls === 1) {
        return {
          ok: true,
          result: [
            { update_id: 1, message: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text: '/ask' } }
          ]
        }
      }

      if (!delivered) {
        return { ok: true, result: [] }
      }

      return {
        ok: true,
        result: [
          { update_id: 2, message: { message_id: 2, date: 0, chat: { id: 100, type: 'private' }, text: 'alice' } }
        ]
      }
    })

    // the send outlasts the reply budget, so a clock started before delivery expires mid-send
    tg.useHook('onBeforeRequest', async (ctx: { method: string }, next: () => Promise<void>) => {
      if (ctx.method !== 'sendMessage') {
        await next()

        return
      }

      await new Promise<void>(resolve => setTimeout(resolve, 400))
      await next()

      delivered = true
    })

    let outcome: { raw: { text: string } } | null | 'pending' = 'pending'

    tg.on('message', async (msg) => {
      if (msg.raw.text !== '/ask') {
        return
      }

      outcome = await tg.flow.prompt(msg.raw.chat.id, 'name?', {
        timeout: 300,
        nullOnTimeout: true
      }) as { raw: { text: string } } | null
    })

    await tg.start()

    tg.startPolling().catch(() => {})

    await waitUntil(() => outcome !== 'pending', 4000)

    tg.stopPolling()

    expect(outcome).not.toBeNull()
    expect((outcome as { raw: { text: string } }).raw.text).toBe('alice')

    await mock.stop()
  })
})
