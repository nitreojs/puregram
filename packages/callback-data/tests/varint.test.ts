import { describe, expect, it } from 'vitest'

import { decodeVarint, encodeVarint, zigzagDecode, zigzagEncode } from '../src/varint'

describe('zigzag', () => {
  it('round-trips signed integers across the safe-int range', () => {
    const samples = [
      0, 1, -1, 2, -2, 31, -32, 32, -33,
      63, -64, 64, -65,
      127, -128, 128, -129,
      4095, -4096, 4096, -4097,
      0xffff, -0x10000, 0x100000, -0x100001,
      0x7fffffff, -0x80000000, 0x80000000, -0x80000001,
      Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER
    ]

    for (const n of samples) {
      const encoded = zigzagEncode(n)

      expect(encoded).toBeGreaterThanOrEqual(0n)
      expect(zigzagDecode(encoded)).toBe(n)
    }
  })
})

describe('varint', () => {
  it('round-trips signed integers', () => {
    const samples = [
      0, 1, -1, 7, -7, 31, -32, 32, -33,
      63, 64, 127, 128, 255, 256, 1023, 1024, 4095, 4096,
      Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER,
      -1234567890, 1234567890, -1001234567890, 1001234567890
    ]

    for (const n of samples) {
      const encoded = encodeVarint(n)

      // every byte must fit in 7 bits so the wire stays single-byte ascii under utf-8
      for (const b of encoded) {
        expect(b).toBeGreaterThanOrEqual(0)
        expect(b).toBeLessThanOrEqual(0x7F)
      }

      const decoded = decodeVarint(encoded, 0)

      expect(decoded.value).toBe(n)
      expect(decoded.length).toBe(encoded.length)
    }
  })

  it('encodes 0 in a single byte', () => {
    expect(encodeVarint(0)).toEqual([0])
  })

  it('encodes -1 and 1 to one byte each', () => {
    expect(encodeVarint(1).length).toBe(1)
    expect(encodeVarint(-1).length).toBe(1)
  })

  it('encodes 1234567890 in fewer bytes than its decimal length', () => {
    const encoded = encodeVarint(1234567890)

    expect(encoded.length).toBeLessThan('1234567890'.length)
  })

  it('throws RangeError on truncated input', () => {
    // a sequence of all-continuation bytes with no terminator
    expect(() => decodeVarint([0x40, 0x40, 0x40], 0)).toThrow(RangeError)
  })

  it('decodes from a non-zero offset', () => {
    const padded = [99, 99, ...encodeVarint(42)]
    const decoded = decodeVarint(padded, 2)

    expect(decoded.value).toBe(42)
  })

  it('fuzzes random round-trips', () => {
    const rng = makeRng(0xC0DE)

    for (let i = 0; i < 5000; i += 1) {
      // mix small and large magnitudes
      const sign = rng() < 0.5 ? -1 : 1
      const magnitude = Math.floor(rng() * Number.MAX_SAFE_INTEGER)
      const n = sign * magnitude

      const encoded = encodeVarint(n)
      const decoded = decodeVarint(encoded, 0)

      expect(decoded.value).toBe(n)
    }
  })
})

// deterministic prng — mulberry32
function makeRng (seed: number) {
  let s = seed

  return () => {
    s = (s + 0x6D2B79F5) >>> 0

    let t = s

    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
