import { Telegram } from 'puregram'
import { describe, expect, it } from 'vitest'

import { InterceptingHttpClient, swapHttpClient } from '../src/http/intercept'

describe('swapHttpClient', () => {
  it('swaps the captured httpClient and restores it', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const intercept = new InterceptingHttpClient(() => ({
      ok: true,
      result: { message_id: 1, date: 0, chat: { id: 1, type: 'private' }, text: 'hi' }
    }))

    const restore = swapHttpClient(tg, intercept)

    const result = await tg.api.sendMessage({ chat_id: 1, text: 'hi' })

    expect((result as { message_id: number }).message_id).toBe(1)

    restore()
  })
})
