import { describe, expect, it } from 'vitest'

import { FILE_TYPE_TO_UNIQUE, FileType } from '../../src/constants'
import { parseFileId } from '../../src/file-id/parse'
import { fileUniqueIdFromFileId } from '../../src/file-unique-id/from-file-id'
import { serializeFileUniqueId } from '../../src/file-unique-id/serialize'
import { FIXTURES } from '../fixtures/file-ids'

describe('fileUniqueIdFromFileId', () => {
  it('derives the same unique_id from old- and new-style stickers', () => {
    const oldFile = parseFileId(FIXTURES.STICKER_OLD)
    const newFile = parseFileId(FIXTURES.STICKER_NEW)
    const expected = 'AgADegAD997LEQ'

    expect(serializeFileUniqueId(fileUniqueIdFromFileId(oldFile))).toBe(expected)
    expect(serializeFileUniqueId(fileUniqueIdFromFileId(newFile))).toBe(expected)
  })

  it('derives a photo unique_id with volume_id + local_id', () => {
    const file = parseFileId(FIXTURES.PHOTO_V4_22)
    const unique = fileUniqueIdFromFileId(file)

    expect(unique.kind).toBe('photo')

    if (unique.kind !== 'photo') {
      throw new Error('expected photo')
    }

    expect(unique.volumeId).toBe(257017715n)
    expect(unique.localId).toBe(110699)
  })

  it('maps every real file type to a unique_id class', () => {
    for (let fileType: FileType = 0; fileType < FileType.Size; fileType++) {
      expect(FILE_TYPE_TO_UNIQUE.has(fileType)).toBe(true)
    }
  })
})
