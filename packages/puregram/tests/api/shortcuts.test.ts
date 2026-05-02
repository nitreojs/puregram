import { describe, it, expect, vi } from 'vitest'

import { InputMedia, MediaSource } from '../../src'
import { Telegram } from '../../src/telegram'

const stubApi = (tg: Telegram, method: string, returns: unknown = undefined) => {
  const fn = vi.fn().mockResolvedValue(returns)

  Object.defineProperty(tg, 'api', {
    value: { [method]: fn },
    configurable: true
  })

  return fn
}

describe('tg.<verb> shortcuts', () => {
  it('tg.send delegates to api.sendMessage', async () => {
    const tg = new Telegram({ token: 'X' })
    const fn = stubApi(tg, 'sendMessage', { id: 1 })

    await tg.send(123, 'hi')
    expect(fn).toHaveBeenCalledWith({ chat_id: 123, text: 'hi' })
  })

  it('tg.send merges optional params', async () => {
    const tg = new Telegram({ token: 'X' })
    const fn = stubApi(tg, 'sendMessage', { id: 1 })

    await tg.send(456, 'hi', { parse_mode: 'HTML' })
    expect(fn).toHaveBeenCalledWith({ chat_id: 456, text: 'hi', parse_mode: 'HTML' })
  })

  it('tg.forward delegates to forwardMessage', async () => {
    const tg = new Telegram({ token: 'X' })
    const fn = stubApi(tg, 'forwardMessage', { id: 2 })

    await tg.forward(100, 200, 1)
    expect(fn).toHaveBeenCalledWith({ from_chat_id: 100, chat_id: 200, message_id: 1 })
  })

  it('tg.delete delegates to deleteMessage', async () => {
    const tg = new Telegram({ token: 'X' })
    const fn = stubApi(tg, 'deleteMessage', true)

    await tg.delete(123, 456)
    expect(fn).toHaveBeenCalledWith({ chat_id: 123, message_id: 456 })
  })

  it('tg.sendMedia routes a photo to api.sendPhoto and swaps media→photo', async () => {
    const tg = new Telegram({ token: 'X' })
    const fn = stubApi(tg, 'sendPhoto', { id: 9 })

    await tg.sendMedia(123, InputMedia.photo({ media: 'attach://x', caption: 'c' }))
    expect(fn).toHaveBeenCalledWith({ chat_id: 123, photo: 'attach://x', caption: 'c' })
  })

  it('tg.sendMedia routes a synthetic sticker to api.sendSticker', async () => {
    const tg = new Telegram({ token: 'X' })
    const fn = stubApi(tg, 'sendSticker', { id: 10 })
    const m = MediaSource.fileId('cat')

    await tg.sendMedia(456, InputMedia.sticker({ media: m }))
    expect(fn).toHaveBeenCalledWith({ chat_id: 456, sticker: m })
  })

  it('tg.sendMedia throws on unknown media type', () => {
    const tg = new Telegram({ token: 'X' })

    expect(
      () => tg.sendMedia(1, { type: 'bogus' as 'photo', media: 'x' })
    ).toThrow(/unsupported media type/)
  })
})
