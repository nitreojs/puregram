import { describe, expect, it } from 'vitest'

import { base64urlEncode } from '../src/encoding'
import { InlineMessageIdParseError } from '../src/errors'
import { parseInlineMessageId } from '../src/parse'

/** construct a 20-byte legacy fixture from raw fields */
function buildLegacy (dcId: number, id: bigint, accessHash: bigint) {
  const bytes = new Uint8Array(20)
  const view = new DataView(bytes.buffer)

  view.setInt32(0, dcId, true)
  view.setBigInt64(4, id, true)
  view.setBigInt64(12, accessHash, true)

  return base64urlEncode(bytes)
}

/** construct a 24-byte modern fixture from raw fields */
function buildModern (dcId: number, ownerId: bigint, messageId: number, accessHash: bigint) {
  const bytes = new Uint8Array(24)
  const view = new DataView(bytes.buffer)

  view.setInt32(0, dcId, true)
  view.setBigInt64(4, ownerId, true)
  view.setInt32(12, messageId, true)
  view.setBigInt64(16, accessHash, true)

  return base64urlEncode(bytes)
}

describe('parseInlineMessageId — legacy (20-byte) form', () => {
  it('parses a known-good legacy id', () => {
    const fixture = buildLegacy(4, 0x0000007B000001C8n, 0x1234567890ABCDEFn)
    const parsed = parseInlineMessageId(fixture)

    expect(parsed).toEqual({
      kind: 'legacy',
      dcId: 4,
      id: 0x0000007B000001C8n,
      accessHash: 0x1234567890ABCDEFn
    })
  })

  it('preserves negative chat ids in the packed long', () => {
    const packed = BigInt.asIntN(64, (BigInt.asUintN(32, -123n) << 32n) | BigInt.asUintN(32, 456n))
    const fixture = buildLegacy(2, packed, 0n)
    const parsed = parseInlineMessageId(fixture)

    expect(parsed.kind).toBe('legacy')

    if (parsed.kind === 'legacy') {
      expect(parsed.id).toBe(packed)
      expect(Number(BigInt.asIntN(32, parsed.id >> 32n))).toBe(-123)
      expect(Number(BigInt.asIntN(32, parsed.id))).toBe(456)
    }
  })
})

describe('parseInlineMessageId — modern (24-byte) form', () => {
  it('parses a known-good modern id', () => {
    const fixture = buildModern(5, 7000000000n, 42, 0x1EADBEEFCAFEBABEn)
    const parsed = parseInlineMessageId(fixture)

    expect(parsed).toEqual({
      kind: 'modern',
      dcId: 5,
      ownerId: 7000000000n,
      messageId: 42,
      accessHash: 0x1EADBEEFCAFEBABEn
    })
  })

  it('preserves negative message ids', () => {
    const fixture = buildModern(2, 12345n, -7, 1n)
    const parsed = parseInlineMessageId(fixture)

    expect(parsed.kind).toBe('modern')

    if (parsed.kind === 'modern') {
      expect(parsed.messageId).toBe(-7)
    }
  })

  it('preserves negative access hashes', () => {
    const fixture = buildModern(2, 12345n, 1, -1n)
    const parsed = parseInlineMessageId(fixture)

    expect(parsed.kind).toBe('modern')

    if (parsed.kind === 'modern') {
      expect(parsed.accessHash).toBe(-1n)
    }
  })
})

describe('parseInlineMessageId — error cases', () => {
  it('throws on empty input', () => {
    expect(() => parseInlineMessageId('')).toThrow(InlineMessageIdParseError)
  })

  it('throws on non-string input', () => {
    expect(() => parseInlineMessageId(null as unknown as string)).toThrow(InlineMessageIdParseError)
  })

  it('throws on wrong decoded length', () => {
    const fifteenBytes = base64urlEncode(new Uint8Array(15))

    expect(() => parseInlineMessageId(fifteenBytes)).toThrow(/20 or 24 bytes/)
  })

  it('throws on 22-byte decoded length (between legacy and modern)', () => {
    const twentyTwo = base64urlEncode(new Uint8Array(22))

    expect(() => parseInlineMessageId(twentyTwo)).toThrow(/20 or 24 bytes/)
  })

  it('attaches the offending input to the error', () => {
    try {
      parseInlineMessageId('!!!not_base64')
    } catch (error) {
      expect(error).toBeInstanceOf(InlineMessageIdParseError)
      expect((error as InlineMessageIdParseError).input).toBeDefined()
    }
  })
})
