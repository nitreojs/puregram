import { describe, it, expect } from 'vitest'

import { mergeDefaultParams } from '../src/api/default-params'

describe('mergeDefaultParams', () => {
  it('returns call params untouched when no defaults are configured', () => {
    const out = mergeDefaultParams(undefined, 'sendMessage', { chat_id: 1, text: 'hi' }, ['chat_id', 'text', 'parse_mode'])

    expect(out).toEqual({ chat_id: 1, text: 'hi' })
  })

  it('returns call params untouched when nothing targets the method', () => {
    const defaults = { sendPhoto: { has_spoiler: true } } as never
    const out = mergeDefaultParams(defaults, 'sendMessage', { chat_id: 1 }, ['chat_id', 'text', 'parse_mode'])

    expect(out).toEqual({ chat_id: 1 })
  })

  it('applies a global default when the method accepts the param', () => {
    const defaults = { '*': { parse_mode: 'HTML' } } as never
    const out = mergeDefaultParams(defaults, 'sendMessage', { chat_id: 1, text: 'hi' }, ['chat_id', 'text', 'parse_mode'])

    expect(out).toEqual({ chat_id: 1, text: 'hi', parse_mode: 'HTML' })
  })

  it('skips a global default when the method does not accept the param', () => {
    const defaults = { '*': { parse_mode: 'HTML' } } as never
    const out = mergeDefaultParams(defaults, 'sendDice', { chat_id: 1, emoji: '🎲' }, ['chat_id', 'emoji'])

    expect(out).toEqual({ chat_id: 1, emoji: '🎲' })
  })

  it('per-method default overrides a global default', () => {
    const defaults = { '*': { parse_mode: 'HTML' }, sendMessage: { parse_mode: 'MarkdownV2' } } as never
    const out = mergeDefaultParams(defaults, 'sendMessage', { chat_id: 1, text: 'hi' }, ['chat_id', 'text', 'parse_mode'])

    expect(out).toEqual({ chat_id: 1, text: 'hi', parse_mode: 'MarkdownV2' })
  })

  it('call-site param wins over both per-method and global defaults', () => {
    const defaults = { '*': { parse_mode: 'HTML' }, sendMessage: { disable_notification: true } } as never
    const out = mergeDefaultParams(
      defaults,
      'sendMessage',
      { chat_id: 1, text: 'hi', parse_mode: 'MarkdownV2', disable_notification: false },
      ['chat_id', 'text', 'parse_mode', 'disable_notification']
    )

    expect(out).toEqual({ chat_id: 1, text: 'hi', parse_mode: 'MarkdownV2', disable_notification: false })
  })

  it('replaces object-valued params wholesale instead of deep-merging', () => {
    const defaults = { '*': { link_preview_options: { is_disabled: true } } } as never
    const out = mergeDefaultParams(
      defaults,
      'sendMessage',
      { chat_id: 1, text: 'hi', link_preview_options: { prefer_large_media: true } },
      ['chat_id', 'text', 'link_preview_options']
    )

    expect(out).toEqual({ chat_id: 1, text: 'hi', link_preview_options: { prefer_large_media: true } })
  })

  it('does not apply global defaults to methods with unknown params (raw call escape)', () => {
    const defaults = { '*': { parse_mode: 'HTML' } } as never
    const out = mergeDefaultParams(defaults, 'someFutureMethod', { chat_id: 1 }, undefined)

    expect(out).toEqual({ chat_id: 1 })
  })
})
