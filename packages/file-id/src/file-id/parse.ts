import {
  FILE_REFERENCE_FLAG,
  FileType,
  isPhotoFileType,
  SUPPORTED_VERSIONS,
  WEB_LOCATION_FLAG
} from '../constants'
import {
  base64urlDecode,
  BinaryReader,
  rleDecode,
  unpackTlString
} from '../encoding'
import { FileIdParseError, UnsupportedFileIdVersionError } from '../errors'
import { parsePhotoSizeSource } from '../photo-size-source/parse'

import type { ParsedFileId } from './types'

// eslint-disable-next-line local-rules/no-redundant-return-type -- discriminant unions need explicit kind to narrow
export function parseFileId (input: string): ParsedFileId {
  const decoded = rleDecode(base64urlDecode(input))

  if (decoded.byteLength < 2) {
    throw new FileIdParseError('file_id too short', input)
  }

  // version is the last byte; sub_version (only when version === 4) is second-to-last
  const version = decoded[decoded.byteLength - 1] ?? 0
  const hasSubVersion = version === 4
  const subVersion = hasSubVersion ? (decoded[decoded.byteLength - 2] ?? 0) : 0
  const payloadEnd = decoded.byteLength - (hasSubVersion ? 2 : 1)

  if (!SUPPORTED_VERSIONS.includes(version)) {
    throw new UnsupportedFileIdVersionError(version, subVersion)
  }

  const reader = new BinaryReader(decoded.subarray(0, payloadEnd))

  const rawTypeId = reader.readU32()
  const hasWebLocation = (rawTypeId & WEB_LOCATION_FLAG) !== 0
  const hasFileReference = (rawTypeId & FILE_REFERENCE_FLAG) !== 0
  const fileType = (rawTypeId & ~WEB_LOCATION_FLAG & ~FILE_REFERENCE_FLAG) as FileType

  if (fileType >= FileType.Size) {
    throw new FileIdParseError(`unknown file type ${fileType}`, input)
  }

  const dcId = reader.readU32()

  let fileReference: Uint8Array | undefined

  if (hasFileReference) {
    fileReference = unpackTlString(reader)
  }

  if (hasWebLocation) {
    const url = new TextDecoder('utf-8').decode(unpackTlString(reader))
    const accessHash = reader.readI64()

    return {
      kind: 'web',
      source: input,
      version,
      subVersion,
      fileType,
      dcId,
      ...(fileReference !== undefined ? { fileReference } : {}),
      url,
      accessHash
    }
  }

  const id = reader.readI64()
  const accessHash = reader.readI64()

  if (isPhotoFileType(fileType)) {
    const photoSize = parsePhotoSizeSource(reader, version, subVersion)

    return {
      kind: 'photo',
      source: input,
      version,
      subVersion,
      fileType,
      dcId,
      ...(fileReference !== undefined ? { fileReference } : {}),
      id,
      accessHash,
      photoSize
    }
  }

  return {
    kind: 'document',
    source: input,
    version,
    subVersion,
    fileType,
    dcId,
    ...(fileReference !== undefined ? { fileReference } : {}),
    id,
    accessHash
  }
}
