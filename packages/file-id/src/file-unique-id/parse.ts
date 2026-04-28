import { FileUniqueType } from '../constants'
import {
  base64urlDecode,
  BinaryReader,
  rleDecode,
  unpackTlString
} from '../encoding'
import { FileIdParseError } from '../errors'

// some legacy unique_ids in the wild were rle-encoded with a bug that dropped trailing zeros
// pad to the expected length so the bigint reader doesn't fall off the end
function padTrailingZeros (decoded: Uint8Array) {
  if (decoded.byteLength === 0) {
    return decoded
  }

  const view = new DataView(decoded.buffer, decoded.byteOffset, decoded.byteLength)
  const typeId = view.getInt32(0, true) as FileUniqueType
  const expected =
    typeId === FileUniqueType.Photo
      ? 16
      : typeId === FileUniqueType.Web
        ? decoded.byteLength
        : 12

  if (decoded.byteLength >= expected) {
    return decoded
  }

  const padded = new Uint8Array(expected)

  padded.set(decoded)

  return padded
}

export function parseFileUniqueId (input: string) {
  const decoded = padTrailingZeros(rleDecode(base64urlDecode(input)))
  const reader = new BinaryReader(decoded)
  const typeId = reader.readI32() as FileUniqueType

  switch (typeId) {
    case FileUniqueType.Web: {
      const url = new TextDecoder('utf-8').decode(unpackTlString(reader))

      return { kind: 'web' as const, source: input, url }
    }

    case FileUniqueType.Photo: {
      const volumeId = reader.readI64()
      const localId = reader.readI32()

      return { kind: 'photo' as const, source: input, volumeId, localId }
    }

    case FileUniqueType.Document:
      return { kind: 'document' as const, source: input, id: reader.readI64() }

    case FileUniqueType.Secure:
      return { kind: 'secure' as const, source: input, id: reader.readI64() }

    case FileUniqueType.Encrypted:
      return { kind: 'encrypted' as const, source: input, id: reader.readI64() }

    case FileUniqueType.Temp:
      return { kind: 'temp' as const, source: input, id: reader.readI64() }

    default:
      throw new FileIdParseError(`unknown file_unique_id type ${typeId as number}`, input)
  }
}
