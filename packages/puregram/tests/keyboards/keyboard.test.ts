import { describe, it, expect } from 'vitest'
import { Keyboard } from '../../src/keyboards'

describe('Keyboard', () => {
  it('builds a keyboard with text buttons', () => {
    const kb = Keyboard.keyboard([['hi', 'bye']])
    const json = kb.toJSON()
    expect(json.keyboard).toEqual([[{ text: 'hi' }, { text: 'bye' }]])
  })

  it('chains options', () => {
    const kb = Keyboard.keyboard([['x']])
      .resize()
      .oneTime()
      .selective()
      .persistent()
      .setPlaceholder('say hi')
    const json = kb.toJSON()
    expect(json.resize_keyboard).toBe(true)
    expect(json.one_time_keyboard).toBe(true)
    expect(json.selective).toBe(true)
    expect(json.is_persistent).toBe(true)
    expect(json.input_field_placeholder).toBe('say hi')
  })

  it('button styles propagate', () => {
    const button = Keyboard.textButton('hello', { style: 'danger', iconCustomEmojiId: '123' })
    expect((button as any).style).toBe('danger')
    expect((button as any).icon_custom_emoji_id).toBe('123')
  })
})
