import { describe, expect, it } from 'vitest'

import { BinaryReader, BinaryWriter } from '../../src/encoding/reader'

describe('BinaryWriter + BinaryReader', () => {
  it('round-trips i32 LE', () => {
    const writer = new BinaryWriter()

    writer.writeI32(-12345)
    writer.writeI32(42)

    const reader = new BinaryReader(writer.toBytes())

    expect(reader.readI32()).toBe(-12345)
    expect(reader.readI32()).toBe(42)
  })

  it('round-trips u32 LE', () => {
    const writer = new BinaryWriter()

    writer.writeU32(0xfeedface)

    const reader = new BinaryReader(writer.toBytes())

    expect(reader.readU32()).toBe(0xfeedface)
  })

  it('round-trips i64 LE as bigint', () => {
    const writer = new BinaryWriter()

    writer.writeI64(984697977903775939n)
    writer.writeI64(-8653026958495010306n)

    const reader = new BinaryReader(writer.toBytes())

    expect(reader.readI64()).toBe(984697977903775939n)
    expect(reader.readI64()).toBe(-8653026958495010306n)
  })

  it('readBytes / writeBytes pass through raw bytes', () => {
    const writer = new BinaryWriter()

    writer.writeBytes(new Uint8Array([1, 2, 3, 4]))

    const reader = new BinaryReader(writer.toBytes())

    expect(reader.readBytes(4)).toEqual(new Uint8Array([1, 2, 3, 4]))
  })

  it('reader tracks remaining bytes', () => {
    const reader = new BinaryReader(new Uint8Array([1, 2, 3]))

    expect(reader.remaining).toBe(3)

    reader.readBytes(1)

    expect(reader.remaining).toBe(2)
  })
})
