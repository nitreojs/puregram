import { describe, expect, it } from 'vitest'

import * as api from '../src'

describe('public api surface', () => {
  it('exports every documented function', () => {
    const required = [
      'parseFileId', 'serializeFileId', 'FileId',
      'isPhotoFileId', 'isDocumentFileId', 'isWebFileId', 'isStickerFileId',
      'parseFileUniqueId', 'serializeFileUniqueId', 'fileUniqueIdFromFileId', 'FileUniqueId',
      'isWebUniqueId', 'isPhotoUniqueId', 'isDocumentUniqueId',
      'isSecureUniqueId', 'isEncryptedUniqueId', 'isTempUniqueId',
      'parsePhotoSizeSource', 'serializePhotoSizeSource',
      'base64urlDecode', 'base64urlEncode', 'rleDecode', 'rleEncode',
      'packTlString', 'unpackTlString',
      'BinaryReader', 'BinaryWriter',
      'FileIdParseError', 'UnsupportedFileIdVersionError'
    ] as const

    for (const name of required) {
      expect(api).toHaveProperty(name)
    }
  })

  it('exports the FileType enum', () => {
    expect(api.FileType.Sticker).toBe(8)
  })
})
