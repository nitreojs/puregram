import type { BinaryReader, BinaryWriter } from './reader'

function alignTo4 (value: number) {
  return (4 - (value % 4)) % 4
}

export function packTlString (writer: BinaryWriter, bytes: Uint8Array) {
  const length = bytes.byteLength

  if (length <= 253) {
    writer.writeU8(length)
    writer.writeBytes(bytes)

    const pad = alignTo4(length + 1)

    if (pad > 0) {
      writer.writeBytes(new Uint8Array(pad))
    }

    return
  }

  writer.writeU8(254)
  writer.writeU8(length & 0xff)
  writer.writeU8((length >> 8) & 0xff)
  writer.writeU8((length >> 16) & 0xff)
  writer.writeBytes(bytes)

  const pad = alignTo4(length)

  if (pad > 0) {
    writer.writeBytes(new Uint8Array(pad))
  }
}

export function unpackTlString (reader: BinaryReader) {
  const first = reader.readU8()

  if (first === 254) {
    const low = reader.readU8()
    const mid = reader.readU8()
    const high = reader.readU8()
    const length = low | (mid << 8) | (high << 16)
    const bytes = reader.readBytes(length)
    const pad = alignTo4(length)

    if (pad > 0) {
      reader.skip(pad)
    }

    return bytes
  }

  const length = first
  const bytes = reader.readBytes(length)
  const pad = alignTo4(length + 1)

  if (pad > 0) {
    reader.skip(pad)
  }

  return bytes
}
