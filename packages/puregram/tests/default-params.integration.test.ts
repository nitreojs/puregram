import { describe, it, expect } from 'vitest'

import type { HttpClient } from '../src/http/client'
import { Telegram } from '../src/telegram'

const okClient: HttpClient = {
  request: () => Promise.resolve({ status: 200, json: () => Promise.resolve({ ok: true, result: {} }) })
}

// capture the params the real request pipeline produces, after defaults are merged
function captureParams (tg: Telegram) {
  const box: { params?: Record<string, unknown> } = {}

  tg.useHook('onBeforeRequest', (ctx) => {
    box.params = ctx.params
  })

  return box
}

describe('defaultParams (end-to-end through runRequest)', () => {
  it('injects a global default into a method that accepts it', async () => {
    const tg = new Telegram({ token: 'X', httpClient: okClient, defaultParams: { '*': { parse_mode: 'HTML' } } })
    const box = captureParams(tg)

    await tg.api.sendMessage({ chat_id: 1, text: 'hi' })

    expect(box.params).toMatchObject({ chat_id: 1, text: 'hi', parse_mode: 'HTML' })
  })

  it('does not inject a global default into a method that rejects it', async () => {
    const tg = new Telegram({ token: 'X', httpClient: okClient, defaultParams: { '*': { parse_mode: 'HTML' } } })
    const box = captureParams(tg)

    await tg.api.sendDice({ chat_id: 1 })

    expect(box.params?.parse_mode).toBeUndefined()
  })

  it('lets the call site override a default', async () => {
    const tg = new Telegram({ token: 'X', httpClient: okClient, defaultParams: { sendMessage: { parse_mode: 'HTML' } } })
    const box = captureParams(tg)

    await tg.api.sendMessage({ chat_id: 1, text: 'hi', parse_mode: 'MarkdownV2' })

    expect(box.params?.parse_mode).toBe('MarkdownV2')
  })
})
