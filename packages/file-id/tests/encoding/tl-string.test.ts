import { describe, expect, it } from 'vitest'

import { BinaryReader, BinaryWriter } from '../../src/encoding/reader'
import { packTlString, unpackTlString } from '../../src/encoding/tl-string'

describe('packTlString + unpackTlString', () => {
  it('round-trips short bytestrings', () => {
    const writer = new BinaryWriter()

    packTlString(writer, new Uint8Array([1, 2, 3, 4]))

    const reader = new BinaryReader(writer.toBytes())

    expect(unpackTlString(reader)).toEqual(new Uint8Array([1, 2, 3, 4]))
  })

  it('pads short payloads to a 4-byte boundary', () => {
    const writer = new BinaryWriter()

    packTlString(writer, new Uint8Array([1, 2, 3]))

    expect(writer.toBytes().byteLength).toBe(4)

    const writer2 = new BinaryWriter()

    packTlString(writer2, new Uint8Array([1, 2, 3, 4]))

    expect(writer2.toBytes().byteLength).toBe(8)
  })

  it('uses 254-marker + u24 length for payloads > 253 bytes', () => {
    const big = new Uint8Array(300)

    big.fill(0xab)

    const writer = new BinaryWriter()

    packTlString(writer, big)

    const reader = new BinaryReader(writer.toBytes())

    expect(unpackTlString(reader)).toEqual(big)
  })

  it('packs "test" as 04 74 65 73 74 00 00 00', () => {
    const writer = new BinaryWriter()

    packTlString(writer, new TextEncoder().encode('test'))

    expect(writer.toBytes()).toEqual(new Uint8Array([0x04, 0x74, 0x65, 0x73, 0x74, 0x00, 0x00, 0x00]))
  })
})
