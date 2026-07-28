import { FILE_REFERENCE_FLAG, type FileType, isPhotoFileType, WEB_LOCATION_FLAG } from '../constants'
import {
  base64urlEncode,
  BinaryWriter,
  packTlString,
  rleEncode
} from '../encoding'
import { serializePhotoSizeSource } from '../photo-size-source/serialize'

import type { ParsedFileId } from './types'

function assertPhotoFileType (fileType: FileType) {
  if (!isPhotoFileType(fileType)) {
    throw new Error(`photo FileId requires a photo-class file type, got ${fileType}`)
  }
}

export function serializeFileId (file: ParsedFileId) {
  const writer = new BinaryWriter()

  let typeFlags: number = file.fileType

  if (file.fileReference !== undefined) {
    typeFlags |= FILE_REFERENCE_FLAG
  }

  if (file.kind === 'web') {
    typeFlags |= WEB_LOCATION_FLAG
  }

  writer.writeU32(typeFlags >>> 0)
  writer.writeU32(file.dcId)

  if (file.fileReference !== undefined) {
    packTlString(writer, file.fileReference)
  }

  if (file.kind === 'web') {
    packTlString(writer, new TextEncoder().encode(file.url))
    writer.writeI64(file.accessHash)
  } else {
    writer.writeI64(file.id)
    writer.writeI64(file.accessHash)

    if (file.kind === 'photo') {
      assertPhotoFileType(file.fileType)
      serializePhotoSizeSource(writer, file.photoSize, file.version, file.subVersion)
    }
  }

  if (file.version >= 4) {
    writer.writeU8(file.subVersion)
  }

  writer.writeU8(file.version)

  return base64urlEncode(rleEncode(writer.toBytes()))
}
