import { FileUniqueType } from '../constants'
import {
  base64urlEncode,
  BinaryWriter,
  packTlString,
  rleEncode
} from '../encoding'

import type { ParsedFileUniqueId } from './types'

export function serializeFileUniqueId (unique: ParsedFileUniqueId) {
  const writer = new BinaryWriter()

  switch (unique.kind) {
    case 'web':
      writer.writeI32(FileUniqueType.Web)
      packTlString(writer, new TextEncoder().encode(unique.url))
      break

    case 'photo':
      writer.writeI32(FileUniqueType.Photo)
      writer.writeI64(unique.volumeId)
      writer.writeI32(unique.localId)
      break

    case 'document':
      writer.writeI32(FileUniqueType.Document)
      writer.writeI64(unique.id)
      break

    case 'secure':
      writer.writeI32(FileUniqueType.Secure)
      writer.writeI64(unique.id)
      break

    case 'encrypted':
      writer.writeI32(FileUniqueType.Encrypted)
      writer.writeI64(unique.id)
      break

    case 'temp':
      writer.writeI32(FileUniqueType.Temp)
      writer.writeI64(unique.id)
      break
  }

  return base64urlEncode(rleEncode(writer.toBytes()))
}
