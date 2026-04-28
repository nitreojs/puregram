import { describe, expect, it } from 'vitest'

import {
  isDocumentFileId,
  isPhotoFileId,
  isStickerFileId,
  isWebFileId
} from '../../src/file-id/guards'
import { parseFileId } from '../../src/file-id/parse'
import { FIXTURES } from '../fixtures/file-ids'

describe('FileId guards', () => {
  it('isPhotoFileId narrows for PHOTO_V2', () => {
    expect(isPhotoFileId(parseFileId(FIXTURES.PHOTO_V2))).toBe(true)
  })

  it('isDocumentFileId narrows for STICKER_V2', () => {
    expect(isDocumentFileId(parseFileId(FIXTURES.STICKER_V2))).toBe(true)
  })

  it('isStickerFileId is true for stickers, false for non-stickers', () => {
    expect(isStickerFileId(parseFileId(FIXTURES.STICKER_V2))).toBe(true)
    expect(isStickerFileId(parseFileId(FIXTURES.PHOTO_V2))).toBe(false)
  })

  it('isWebFileId is false for non-web fixtures', () => {
    expect(isWebFileId(parseFileId(FIXTURES.PHOTO_V2))).toBe(false)
  })
})
