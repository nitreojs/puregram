import { describe, expect, it } from 'vitest'

import { flow, WaitForCancelled } from '../../src'
import { makeTg } from '../helpers/make-tg'

describe('@puregram/flow — prompt cancelled mid-send', () => {
  it('surfaces the cancellation to the caller without an unhandled rejection', async () => {
    const { tg, mock } = await makeTg(t => t.extend(flow()))

    mock.expect('sendMessage', (params: Record<string, unknown>) => ({
      ok: true,
      result: { message_id: 99, date: 0, chat: { id: params.chat_id, type: 'private' }, text: params.text }
    }))

    const sendStarted = Promise.withResolvers<void>()

    tg.useHook('onBeforeRequest', async (ctx: { method: string }, next: () => Promise<void>) => {
      if (ctx.method === 'sendMessage') {
        sendStarted.resolve()

        await new Promise<void>(resolve => setTimeout(resolve, 300))
      }

      await next()
    })

    await tg.start()

    const pending = tg.flow.prompt(100, 'name?')

    await sendStarted.promise

    // cancelAll is reachable mid-send from tg.flow.cancelAll() and the onShutdown hook
    tg.flow.cancelAll()

    await expect(pending).rejects.toThrow(WaitForCancelled)

    await mock.stop()
  })
})
