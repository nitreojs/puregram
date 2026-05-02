import { describe, expect, it } from 'vitest'

import { composeKey, defaultGetKey } from '../src/key'
import type { AnyUpdate } from '../src/types'

const u = <T>(value: T) => value as unknown as AnyUpdate

describe('defaultGetKey', () => {
  it('prefers from.id', () => {
    expect(defaultGetKey(u({ from: { id: 1 }, senderChat: { id: 2 }, chat: { id: 3 } }))).toBe('1')
  })

  it('falls back to senderChat.id when from is absent', () => {
    expect(defaultGetKey(u({ senderChat: { id: 2 }, chat: { id: 3 } }))).toBe('2')
  })

  it('falls back to chat.id when from and senderChat are absent', () => {
    expect(defaultGetKey(u({ chat: { id: 3 } }))).toBe('3')
  })

  it('returns undefined when nothing resolves', () => {
    expect(defaultGetKey(u({ kind: 'orphan' }))).toBeUndefined()
  })

  it('coerces numeric and string ids to string', () => {
    expect(defaultGetKey(u({ from: { id: 42 } }))).toBe('42')
    expect(defaultGetKey(u({ from: { id: 'abc' } }))).toBe('abc')
  })
})

describe('composeKey', () => {
  it('uses `default` bucket when none supplied', () => {
    expect(composeKey('1')).toBe('default:1')
  })

  it('uses the supplied bucket', () => {
    expect(composeKey('1', 'pay')).toBe('pay:1')
  })
})
