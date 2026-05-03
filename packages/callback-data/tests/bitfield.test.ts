import { describe, expect, it } from 'vitest'

import { BitReader, BitWriter, bytesForBits } from '../src/bitfield'

describe('bytesForBits', () => {
  it('rounds up to whole bytes', () => {
    expect(bytesForBits(0)).toBe(0)
    expect(bytesForBits(1)).toBe(1)
    expect(bytesForBits(7)).toBe(1)
    expect(bytesForBits(8)).toBe(2)
    expect(bytesForBits(14)).toBe(2)
    expect(bytesForBits(15)).toBe(3)
  })
})

describe('BitWriter / BitReader', () => {
  it('round-trips an empty stream', () => {
    const w = new BitWriter()
    const bytes = w.finish()

    expect(bytes).toEqual([])
  })

  it('produces ascii-safe bytes (high bit always zero)', () => {
    const w = new BitWriter()

    for (let i = 0; i < 100; i += 1) {
      w.write(i % 2)
    }

    for (const b of w.finish()) {
      expect(b).toBeLessThanOrEqual(0x7F)
    }
  })

  it('round-trips a bit sequence', () => {
    const sequence = [1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1]
    const w = new BitWriter()

    for (const bit of sequence) {
      w.write(bit)
    }

    const bytes = w.finish()
    const r = new BitReader(bytes, 0)

    for (const bit of sequence) {
      expect(r.read()).toBe(bit)
    }
  })

  it('round-trips multi-bit values lsb first', () => {
    const w = new BitWriter()

    w.writeBits(0b101, 3)
    w.writeBits(0b1100, 4)
    w.writeBits(0b11111111, 8)

    const r = new BitReader(w.finish(), 0)

    expect(r.readBits(3)).toBe(0b101)
    expect(r.readBits(4)).toBe(0b1100)
    expect(r.readBits(8)).toBe(0b11111111)
  })

  it('handles cross-byte boundaries', () => {
    // 7 bits per byte means 9 bits straddles a byte
    const w = new BitWriter()

    w.writeBits(0b110011001, 9)

    const r = new BitReader(w.finish(), 0)

    expect(r.readBits(9)).toBe(0b110011001)
  })

  it('throws on read past end', () => {
    const w = new BitWriter()

    w.write(1)

    const r = new BitReader(w.finish(), 0)

    r.read()
    expect(() => {
      r.read()
      r.read()
      r.read()
      r.read()
      r.read()
      r.read()
      r.read()
      r.read()
    }).toThrow(RangeError)
  })
})
