import { describe, expect, it } from 'vitest'

import { rleDecode, rleEncode } from '../../src/encoding/rle'

describe('rleEncode', () => {
  it('passes non-zero bytes through', () => {
    expect(rleEncode(new Uint8Array([1, 2, 3]))).toEqual(new Uint8Array([1, 2, 3]))
  })

  it('collapses runs of zeros to [0, count]', () => {
    expect(rleEncode(new Uint8Array([1, 0, 0, 0, 2]))).toEqual(new Uint8Array([1, 0, 3, 2]))
  })

  it('handles trailing zero runs', () => {
    expect(rleEncode(new Uint8Array([1, 0, 0]))).toEqual(new Uint8Array([1, 0, 2]))
  })
})

describe('rleDecode', () => {
  it('expands [0, count] back to zero runs', () => {
    expect(rleDecode(new Uint8Array([1, 0, 3, 2]))).toEqual(new Uint8Array([1, 0, 0, 0, 2]))
  })

  it('round-trips arbitrary bytes', () => {
    const input = new Uint8Array([0, 0, 1, 2, 0, 0, 0, 3, 0])

    expect(rleDecode(rleEncode(input))).toEqual(input)
  })
})
