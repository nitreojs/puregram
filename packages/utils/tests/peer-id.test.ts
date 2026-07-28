import { describe, expect, it } from 'vitest'

import {
  getPeerType,
  isChannelId,
  isChatId,
  isUserId,
  parsePeerId,
  PeerIdError,
  toBotApiId,
  toMtprotoId
} from '../src/peer-id'

describe('parsePeerId', () => {
  it('positive id → user', () => {
    expect(parsePeerId(123456789)).toEqual({ type: 'user', id: 123456789 })
  })

  it('small negative id → basic group', () => {
    expect(parsePeerId(-987654321)).toEqual({ type: 'chat', id: 987654321 })
  })

  it('-100… prefixed id → channel', () => {
    expect(parsePeerId(-1001234567890)).toEqual({ type: 'channel', id: 1234567890 })
  })

  it('-999999999999 → chat (boundary)', () => {
    expect(parsePeerId(-999999999999)).toEqual({ type: 'chat', id: 999999999999 })
  })

  it('-1000000000001 → channel #1 (boundary)', () => {
    expect(parsePeerId(-1000000000001)).toEqual({ type: 'channel', id: 1 })
  })

  it('throws on 0', () => {
    expect(() => parsePeerId(0)).toThrow(PeerIdError)
  })

  it('throws on -1000000000000 (channel #0)', () => {
    expect(() => parsePeerId(-1000000000000)).toThrow(PeerIdError)
  })

  it('throws on a non-integer', () => {
    expect(() => parsePeerId(3.14)).toThrow(PeerIdError)
  })

  it('throws on an unsafe integer', () => {
    expect(() => parsePeerId(Number.MAX_SAFE_INTEGER + 1)).toThrow(PeerIdError)
  })
})

describe('toMtprotoId', () => {
  it('channel marked → bare', () => {
    expect(toMtprotoId(-1001234567890)).toBe(1234567890)
  })

  it('user id unchanged', () => {
    expect(toMtprotoId(123456789)).toBe(123456789)
  })

  it('throws on invalid', () => {
    expect(() => toMtprotoId(0)).toThrow(PeerIdError)
  })
})

describe('getPeerType', () => {
  it('classifies user / chat / channel', () => {
    expect(getPeerType(123456789)).toBe('user')
    expect(getPeerType(-987654321)).toBe('chat')
    expect(getPeerType(-1001234567890)).toBe('channel')
  })
})

describe('toBotApiId', () => {
  it('user', () => {
    expect(toBotApiId(123456789, 'user')).toBe(123456789)
  })

  it('chat', () => {
    expect(toBotApiId(987654321, 'chat')).toBe(-987654321)
  })

  it('channel', () => {
    expect(toBotApiId(1234567890, 'channel')).toBe(-1001234567890)
  })

  it('round-trips with parsePeerId for every type', () => {
    for (const id of [123456789, -987654321, -1001234567890]) {
      const parsed = parsePeerId(id)

      expect(toBotApiId(parsed.id, parsed.type)).toBe(id)
    }
  })

  it('throws on a non-positive bare id', () => {
    expect(() => toBotApiId(0, 'user')).toThrow(PeerIdError)
    expect(() => toBotApiId(-5, 'channel')).toThrow(PeerIdError)
  })
})

describe('id guards', () => {
  it('isUserId', () => {
    expect(isUserId(123456789)).toBe(true)
    expect(isUserId(-1)).toBe(false)
    expect(isUserId(0)).toBe(false)
    expect(isUserId(3.14)).toBe(false)
  })

  it('isChatId', () => {
    expect(isChatId(-987654321)).toBe(true)
    expect(isChatId(-1000000000000)).toBe(false)
    expect(isChatId(-1001234567890)).toBe(false)
    expect(isChatId(123)).toBe(false)
  })

  it('isChannelId', () => {
    expect(isChannelId(-1001234567890)).toBe(true)
    expect(isChannelId(-1000000000000)).toBe(false)
    expect(isChannelId(-999999999999)).toBe(false)
    expect(isChannelId(123)).toBe(false)
  })
})
