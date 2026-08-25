import { describe, expect, it } from 'vitest'

import { InlineKeyboard, InlineKeyboardBuilder } from '../../src/keyboards'

describe('inline keyboard — disabled buttons', () => {
  it('drops the action, because telegram discards disabled when one is present', () => {
    const button = InlineKeyboard.textButton({ text: 'x', payload: 'y', disabled: true })

    expect(button).toEqual({ text: 'x', disabled: {} })
    expect(button).not.toHaveProperty('callback_data')
  })

  it('leaves the action alone when disabled is false or absent', () => {
    expect(InlineKeyboard.textButton({ text: 'x', payload: 'y', disabled: false }))
      .toEqual({ text: 'x', callback_data: 'y' })
    expect(InlineKeyboard.textButton({ text: 'x', payload: 'y' }))
      .toEqual({ text: 'x', callback_data: 'y' })
  })

  it('keeps style and icon, which telegram does echo back on a disabled button', () => {
    expect(InlineKeyboard.disabledButton({ text: 'x', style: 'danger', iconCustomEmojiId: '5368324170671202286' }))
      .toEqual({ text: 'x', disabled: {}, style: 'danger', icon_custom_emoji_id: '5368324170671202286' })
  })

  it('disables every action-carrying factory the same way', () => {
    expect(InlineKeyboard.urlButton({ text: 'u', url: 'https://t.me', disabled: true }))
      .toEqual({ text: 'u', disabled: {} })
    expect(InlineKeyboard.copyButton({ text: 'c', copy: 'v', disabled: true }))
      .toEqual({ text: 'c', disabled: {} })
    expect(InlineKeyboard.payButton({ text: 'p', disabled: true }))
      .toEqual({ text: 'p', disabled: {} })
  })

  it('builds the same shape from the builder', () => {
    const kb = new InlineKeyboardBuilder()
      .textButton({ text: 'live', payload: 'l' })
      .disabledButton({ text: 'off' })

    expect(kb.toJSON()).toEqual({
      inline_keyboard: [[{ text: 'live', callback_data: 'l' }, { text: 'off', disabled: {} }]]
    })
  })
})
