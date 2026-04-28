import { describe, expect, it } from 'vitest'

import { base64urlDecode, base64urlEncode } from '../../src/encoding/base64url'

describe('base64urlDecode', () => {
  it('decodes a known telegram file_id prefix without padding', () => {
    const bytes = base64urlDecode('CAADBAAD')

    expect(bytes).toEqual(new Uint8Array([0x08, 0x00, 0x03, 0x04, 0x00, 0x03]))
  })

  it('decodes the - and _ aliases', () => {
    const bytes = base64urlDecode('-_8')

    expect(bytes).toEqual(new Uint8Array([0xfb, 0xff]))
  })
})

describe('base64urlEncode', () => {
  it('encodes without padding', () => {
    const encoded = base64urlEncode(new Uint8Array([0xfb, 0xff]))

    expect(encoded).toBe('-_8')
  })

  it('round-trips arbitrary bytes', () => {
    const input = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    expect(base64urlDecode(base64urlEncode(input))).toEqual(input)
  })
})
