// per-kind dispatcher type tests — verify `tg.onMessage(filter, h)` etc.
// narrow the handler arg via `Modify<KindUpdate, ExtractMod<F>>`. mirrors the
// behavior promised by the codegen'd `TelegramDispatchers` interface

import type { CallbackQueryUpdate, MessageUpdate, PrivateChat } from '@puregram/api'
import { MessageUpdate as MessageUpdateClass } from '@puregram/api'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import { callbackData, chat, hasText } from '../../src/filters'
import { Telegram } from '../../src/telegram'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

// dispatch through the real wrapper instance so wrapper-getter predicates
// (`hasText` reads `u.text` which delegates to `raw.text`) resolve correctly
const buildMessage = (extra: Record<string, unknown> = {}, tg: any = {}) =>
  new MessageUpdateClass(
    {
      message_id: 1,
      date: 0,
      chat: { id: 100, type: 'private' },
      ...extra
    } as any,
    tg
  )

describe('per-kind dispatchers', () => {
  it('tg.onMessage(handler) registers a handler against `message` kind', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const handler = vi.fn()

    tg.onMessage(handler)

    await (tg as any).dispatch(buildMessage({ text: 'hi' }, tg))

    expect(handler).toHaveBeenCalledOnce()
  })

  it('tg.onMessage(filter, handler) gates dispatch on the filter', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const handler = vi.fn()

    tg.onMessage(hasText, handler)

    await (tg as any).dispatch(buildMessage({ text: 'hi' }, tg))
    await (tg as any).dispatch(buildMessage({ /* no text */ }, tg))

    expect(handler).toHaveBeenCalledOnce()
  })

  it('tg.onMessage(chat.private, h) narrows m.chat.type to "private"', () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })

    tg.onMessage(chat.private, (m) => {
      expectTypeOf(m.chat).toMatchTypeOf<PrivateChat>()
      expectTypeOf(m.chat.type).toEqualTypeOf<'private'>()
    })
  })

  it('tg.onMessage(chat.private.and(hasText), h) narrows chat AND text', () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })

    tg.onMessage(chat.private.and(hasText), (m) => {
      expectTypeOf(m.chat.type).toEqualTypeOf<'private'>()
      expectTypeOf(m.text).toEqualTypeOf<string>()
    })
  })

  it('tg.onMessage(handler) handler arg is MessageUpdate', () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })

    tg.onMessage((m) => {
      expectTypeOf(m).toEqualTypeOf<MessageUpdate>()
    })
  })

  it('tg.onCallbackQuery(callbackData(/x/), h) attaches match: RegExpMatchArray', () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })

    tg.onCallbackQuery(callbackData(/^buy:(?<sku>.+)$/), (q) => {
      expectTypeOf(q).toMatchTypeOf<CallbackQueryUpdate>()
      expectTypeOf(q.data).toEqualTypeOf<string>()
      expectTypeOf(q.match).toMatchTypeOf<RegExpMatchArray | undefined>()
    })
  })

  it('non-existent dispatcher method is a compile error', () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })

    function _typeCheck () {
      // @ts-expect-error — onNotARealKind is not codegen'd
      const _fn: (h: () => void) => unknown = tg.onNotARealKind.bind(tg)
    }
  })
})
