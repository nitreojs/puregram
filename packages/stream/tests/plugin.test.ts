import { describe, expect, it, vi } from 'vitest'

import { stream } from '../src/plugin'

function makeFakeTg () {
  const sendRichMessage = vi.fn((params: Record<string, unknown>) => Promise.resolve({
    message_id: 1, date: 0, chat: { id: params.chat_id, type: 'private' as const }
  }))
  const sendRichMessageDraft = vi.fn(() => Promise.resolve(true))
  const sendMessage = vi.fn((params: Record<string, unknown>) => Promise.resolve({
    message_id: 1, date: 0, chat: { id: params.chat_id, type: 'private' as const }
  }))
  const sendMessageDraft = vi.fn(() => Promise.resolve(true))

  const tg = {
    api: { sendRichMessage, sendRichMessageDraft, sendMessage, sendMessageDraft },
    useHook: vi.fn(),
    onStoppedMessageGeneration: vi.fn()
  }

  return { tg, sendRichMessage, sendRichMessageDraft, sendMessage, sendMessageDraft }
}

describe('stream plugin — rich wiring', () => {
  it('routes tg.stream({ rich: true }) to the rich methods', async () => {
    const { tg, sendRichMessage, sendMessage } = makeFakeTg()
    const ext = await stream().install(tg as never)

    await ext({
      chat_id: 1,
      source: ['hello rich'],
      rich: true,
      thinkingPlaceholder: false,
      editIntervalMs: 0
    })

    expect(sendRichMessage).toHaveBeenCalledTimes(1)
    expect((sendRichMessage.mock.calls[0]![0] as { rich_message: unknown }).rich_message).toEqual({ markdown: 'hello rich' })
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('routes a plain tg.stream to the text methods', async () => {
    const { tg, sendMessage, sendRichMessage } = makeFakeTg()
    const ext = await stream().install(tg as never)

    await ext({ chat_id: 1, source: ['plain'], thinkingPlaceholder: false, editIntervalMs: 0 })

    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect((sendMessage.mock.calls[0]![0] as { text: unknown }).text).toBe('plain')
    expect(sendRichMessage).not.toHaveBeenCalled()
  })
})
