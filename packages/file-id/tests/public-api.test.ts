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
      'isLegacySource', 'isThumbnailSource',
      'isDialogPhotoSmallSource', 'isDialogPhotoBigSource', 'isStickerSetThumbnailSource',
      'isFullLegacySource', 'isDialogPhotoSmallLegacySource', 'isDialogPhotoBigLegacySource',
      'isStickerSetThumbnailLegacySource', 'isStickerSetThumbnailVersionSource',
      'isPhotoFileType',
      'base64urlDecode', 'base64urlEncode', 'rleDecode', 'rleEncode',
      'packTlString', 'unpackTlString',
      'BinaryReader', 'BinaryWriter',
      'FileIdParseError', 'UnsupportedFileIdVersionError'
    ] as const

    for (const name of required) {
      expect(api).toHaveProperty(name)
    }
  })

  it('exports the FileType enum, in sync with TDLib', () => {
    expect(api.FileType.Sticker).toBe(8)
    expect(api.FileType.LivePhoto).toBe(26)
    expect(api.FileType.SelfDestructingLivePhoto).toBe(27)
    expect(api.FileType.Size).toBe(28)
    expect(api.FileType.None).toBe(29)
  })
})
