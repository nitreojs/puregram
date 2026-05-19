import { describe, expect, it } from 'vitest'

import { parseCommand } from '../src/parse-command'

describe('parseCommand', () => {
  it('parses a bare command', () => {
    expect(parseCommand('/buy')).toEqual({ command: 'buy', bot: undefined, args: [], rest: '' })
  })

  it('parses a command with bot suffix', () => {
    expect(parseCommand('/buy@my_bot')).toEqual({ command: 'buy', bot: 'my_bot', args: [], rest: '' })
  })

  it('parses a command with bot suffix and args', () => {
    expect(parseCommand('/buy@my_bot apples 5 fresh')).toEqual({
      command: 'buy',
      bot: 'my_bot',
      args: ['apples', '5', 'fresh'],
      rest: 'apples 5 fresh'
    })
  })

  it('collapses multi-space runs into a single arg list, rest has leading whitespace trimmed', () => {
    expect(parseCommand('/buy@my_bot   foo')).toEqual({
      command: 'buy',
      bot: 'my_bot',
      args: ['foo'],
      rest: 'foo'
    })
  })

  it('keeps underscores inside args (referral payloads)', () => {
    expect(parseCommand('/start ref_abc123_with_underscores')).toEqual({
      command: 'start',
      bot: undefined,
      args: ['ref_abc123_with_underscores'],
      rest: 'ref_abc123_with_underscores'
    })
  })

  it('returns null for plain text', () => {
    expect(parseCommand('hello')).toBe(null)
  })

  it('returns null for a lone slash', () => {
    expect(parseCommand('/')).toBe(null)
  })

  it('returns null for leading whitespace before slash', () => {
    expect(parseCommand('  /buy')).toBe(null)
  })

  it('returns null for empty string', () => {
    expect(parseCommand('')).toBe(null)
  })

  it('returns null when bot username is too short', () => {
    expect(parseCommand('/buy@bad')).toBe(null)
  })

  it('returns null when bot username exceeds 32 chars', () => {
    expect(parseCommand(`/buy@${'a'.repeat(33)}`)).toBe(null)
  })

  it('handles many internal whitespace characters between args', () => {
    expect(parseCommand('/cmd a\tb\n c')).toEqual({
      command: 'cmd',
      bot: undefined,
      args: ['a', 'b', 'c'],
      rest: 'a\tb\n c'
    })
  })
})
