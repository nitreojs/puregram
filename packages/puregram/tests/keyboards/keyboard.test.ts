import { describe, it, expect } from 'vitest'

import { Keyboard, KeyboardBuilder } from '../../src/keyboards'

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

    expect(button.style).toBe('danger')
    expect(button.icon_custom_emoji_id).toBe('123')
  })

  it('introspection getters', () => {
    const empty = new Keyboard()

    expect(empty.isEmpty).toBe(true)
    expect(empty.rowCount).toBe(0)
    expect(empty.length).toBe(0)

    const kb = Keyboard.keyboard([['a', 'b'], ['c']])

    expect(kb.isEmpty).toBe(false)
    expect(kb.rowCount).toBe(2)
    expect(kb.length).toBe(3)
  })

  it('if applies the matching branch and returns the keyboard', () => {
    const kb = new Keyboard()
      .if(true, k => k.resize())
      .if(false, k => k.selective(), k => k.oneTime())

    const json = kb.toJSON()

    expect(json.resize_keyboard).toBe(true)
    expect(json.selective).toBe(false)
    expect(json.one_time_keyboard).toBe(true)
  })

  it('from(markup) round-trips a reply markup', () => {
    const original = Keyboard.keyboard([['a', 'b']])
      .resize()
      .persistent()
      .setPlaceholder('hi')
      .toJSON()

    const restored = Keyboard.from(original)

    expect(restored.toJSON()).toEqual(original)
  })

  it('clone deep-copies the buttons matrix', () => {
    const original = Keyboard.keyboard([['a', 'b']])
    const cloned = original.clone()

    cloned.delete('a')

    expect(original.toJSON().keyboard).toEqual([[{ text: 'a' }, { text: 'b' }]])
    expect(cloned.toJSON().keyboard).toEqual([[{ text: 'b' }]])
  })
})

describe('KeyboardBuilder', () => {
  it('builds rows with chained text buttons', () => {
    const kb = new KeyboardBuilder()
      .textButton('a')
      .textButton('b')
      .row()
      .textButton('c')

    const json = kb.toJSON()

    expect(json.keyboard).toEqual([[{ text: 'a' }, { text: 'b' }], [{ text: 'c' }]])
  })

  it('introspection counts include the in-progress row', () => {
    const kb = new KeyboardBuilder().textButton('a').textButton('b')

    expect(kb.isEmpty).toBe(false)
    expect(kb.rowCount).toBe(1)
    expect(kb.length).toBe(2)
  })

  it('if applies the matching branch and returns the builder', () => {
    const kb = new KeyboardBuilder()
      .if(true, b => b.textButton('yes'))
      .if(false, b => b.textButton('no'), b => b.textButton('else'))

    expect(kb.toJSON().keyboard).toEqual([[{ text: 'yes' }, { text: 'else' }]])
  })

  it('from(markup) restores rows and flags', () => {
    const original = new KeyboardBuilder()
      .textButton('a')
      .row()
      .textButton('b')
      .resize()
      .persistent()
      .setPlaceholder('hi')
      .toJSON()

    const restored = KeyboardBuilder.from(original)

    expect(restored.toJSON()).toEqual(original)
  })

  it('clone deep-copies committed and in-progress rows', () => {
    const original = new KeyboardBuilder().textButton('a').row().textButton('b')
    const cloned = original.clone()

    cloned.textButton('c')

    expect(original.length).toBe(2)
    expect(cloned.length).toBe(3)
  })
})
