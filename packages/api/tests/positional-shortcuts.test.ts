import { describe, expect, it } from 'vitest'

import {
  ChatMemberUpdate,
  InlineQueryUpdate,
  MessageUpdate,
  PreCheckoutQueryUpdate,
  ShippingQueryUpdate
} from '../src/generated/updates'
import type { TelegramLike } from '../src/telegram-like'

function recordingTg () {
  const calls: { method: string, params: Record<string, unknown> }[] = []
  const api = new Proxy({}, {
    get: (_target, method: string) => (params: Record<string, unknown>) => {
      calls.push({ method, params })

      return Promise.resolve(true)
    }
  })

  return { tg: { api } as unknown as TelegramLike, calls }
}

const INLINE_QUERY_RAW = {
  id: 'q1',
  from: { id: 5, is_bot: false, first_name: 'u' },
  query: 'search',
  offset: ''
}

const MESSAGE_RAW = {
  message_id: 10,
  date: 0,
  chat: { id: -100, type: 'supergroup' as const },
  from: { id: 5, is_bot: false, first_name: 'u' }
}

const CHAT_MEMBER_RAW = {
  chat: { id: -100, type: 'supergroup' as const },
  from: { id: 5, is_bot: false, first_name: 'u' },
  date: 0,
  old_chat_member: { status: 'member', user: { id: 7, is_bot: false, first_name: 'm' } },
  new_chat_member: { status: 'left', user: { id: 7, is_bot: false, first_name: 'm' } }
}

describe('positional primary args on generated shortcuts', () => {
  it('takes inline query results positionally and keeps the rest in params', async () => {
    const { tg, calls } = recordingTg()
    const update = new InlineQueryUpdate(INLINE_QUERY_RAW as never, tg)
    const results = [{ type: 'article', id: '1', title: 'a', input_message_content: { message_text: 'x' } }]

    await update.answer(results as never, { cache_time: 0, is_personal: true })

    expect(calls[0]).toEqual({
      method: 'answerInlineQuery',
      params: { inline_query_id: 'q1', results, cache_time: 0, is_personal: true }
    })
  })

  it('answers a shipping query with ok positionally', async () => {
    const { tg, calls } = recordingTg()
    const update = new ShippingQueryUpdate({
      id: 's1',
      from: INLINE_QUERY_RAW.from,
      invoice_payload: 'p',
      shipping_address: {}
    } as never, tg)

    await update.answer(false, { error_message: 'nope' })

    expect(calls[0]!.params).toEqual({ shipping_query_id: 's1', ok: false, error_message: 'nope' })
  })

  it('answers a pre-checkout query with ok alone', async () => {
    const { tg, calls } = recordingTg()
    const update = new PreCheckoutQueryUpdate({
      id: 'pc1',
      from: INLINE_QUERY_RAW.from,
      currency: 'XTR',
      total_amount: 1,
      invoice_payload: 'p'
    } as never, tg)

    await update.answer(true)

    expect(calls[0]!.params).toEqual({ pre_checkout_query_id: 'pc1', ok: true })
  })

  it('fills chat and member ids for admin shortcuts taking the user positionally', async () => {
    const { tg, calls } = recordingTg()
    const update = new MessageUpdate(MESSAGE_RAW as never, tg)

    await update.promoteChatMember(7, { can_pin_messages: true })
    await update.setChatAdministratorCustomTitle(7, 'boss')

    expect(calls[0]).toEqual({
      method: 'promoteChatMember',
      params: { chat_id: -100, user_id: 7, can_pin_messages: true }
    })
    expect(calls[1]).toEqual({
      method: 'setChatAdministratorCustomTitle',
      params: { chat_id: -100, user_id: 7, custom_title: 'boss' }
    })
  })

  it('drops a positional the update already anchors, and keeps it where it does not', async () => {
    const { tg, calls } = recordingTg()

    await new MessageUpdate(MESSAGE_RAW as never, tg).stopPoll()
    await new ChatMemberUpdate(CHAT_MEMBER_RAW as never, tg).stopPoll(42)

    expect(calls[0]!.params).toEqual({ chat_id: -100, message_id: 10 })
    expect(calls[1]!.params).toEqual({ chat_id: -100, message_id: 42 })
  })

  it('orders the draft id before the draft body', async () => {
    const { tg, calls } = recordingTg()
    const update = new MessageUpdate(MESSAGE_RAW as never, tg)

    await update.sendDraft(3, 'typing…')

    expect(calls[0]).toEqual({
      method: 'sendMessageDraft',
      params: { chat_id: -100, draft_id: 3, text: 'typing…' }
    })
  })
})
