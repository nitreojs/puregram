import { describe, it, expect } from 'vitest'
import { InlineKeyboard } from '../../src/keyboards'

describe('InlineKeyboard', () => {
  it('builds an inline keyboard from rows', () => {
    const kb = InlineKeyboard.keyboard([
      [
        InlineKeyboard.urlButton({ text: 'site', url: 'https://example.com' }),
        InlineKeyboard.textButton({ text: 'click', payload: 'foo' })
      ]
    ])
    const json = kb.toJSON()
    expect(json.inline_keyboard).toHaveLength(1)
    expect(json.inline_keyboard[0]).toHaveLength(2)
    expect(json.inline_keyboard[0]![0]!.url).toBe('https://example.com')
    expect(json.inline_keyboard[0]![1]!.callback_data).toBe('foo')
  })

  it('serializes object payload to JSON string', () => {
    const button = InlineKeyboard.textButton({ text: 'x', payload: { a: 1 } })
    expect(button.callback_data).toBe('{"a":1}')
  })

  it('button styles propagate', () => {
    const button = InlineKeyboard.textButton({ text: 'x', payload: 'y', style: 'success' })
    expect((button as any).style).toBe('success')
  })
})
