import { describe, expect, it } from 'vitest'

import { buildKey, parseKey } from '../../src/persistent/storage-keys'

describe('storage-keys', () => {
  it('buildKey concatenates chatId, fromId, and kind', () => {
    expect(buildKey(123, 456, 'message')).toBe('123:456:message')
  })

  it('buildKey uses * for unscoped fromId', () => {
    expect(buildKey(123, undefined, 'callback_query')).toBe('123:*:callback_query')
  })

  it('parseKey is the inverse', () => {
    expect(parseKey('123:456:message')).toEqual({ chatId: 123, fromId: 456, kind: 'message' })
    expect(parseKey('123:*:callback_query')).toEqual({ chatId: 123, fromId: undefined, kind: 'callback_query' })
  })

  it('parseKey returns undefined for malformed keys', () => {
    expect(parseKey('not-a-key')).toBeUndefined()
    expect(parseKey('1:2')).toBeUndefined()
    expect(parseKey('abc:1:message')).toBeUndefined()
  })
})
