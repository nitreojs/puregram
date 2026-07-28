import { describe, expect, it } from 'vitest'

import { BinaryReader, BinaryWriter } from '../../src/encoding/reader'
import { parsePhotoSizeSource } from '../../src/photo-size-source/parse'
import { serializePhotoSizeSource } from '../../src/photo-size-source/serialize'
import type { PhotoSizeSource } from '../../src/photo-size-source/types'

function roundTrip (source: PhotoSizeSource, version: number, subVersion: number) {
  const writer = new BinaryWriter()

  serializePhotoSizeSource(writer, source, version, subVersion)

  const reader = new BinaryReader(writer.toBytes())
  const parsed = parsePhotoSizeSource(reader, version, subVersion)

  expect(reader.remaining).toBe(0)

  return parsed
}

// pre-AddPhotoSizeSource: no variant tag on the wire, every photo is an implicit legacy triple
const PRE_22: PhotoSizeSource[] = [
  { type: 'legacy', volumeId: 257017715n, secret: 8510641140621971213n, localId: 110700 }
]

// AddPhotoSizeSource..RemovePhotoVolumeAndLocalId: outer volume_id, tag, body, outer local_id
const ERA_22: PhotoSizeSource[] = [
  { type: 'legacy', volumeId: 257017715n, secret: 8510641140621971213n, localId: 110700 },
  { type: 'thumbnail', volumeId: 257017715n, fileType: 2, thumbnailType: 'x', localId: 110699 },
  { type: 'dialog_photo_small', volumeId: 1n, dialogId: 2n, dialogAccessHash: 3n, localId: 4 },
  { type: 'dialog_photo_big', volumeId: 1n, dialogId: 2n, dialogAccessHash: 3n, localId: 4 },
  { type: 'sticker_set_thumbnail', volumeId: 1n, stickerSetId: 2n, stickerSetAccessHash: 3n, localId: 4 }
]

// RemovePhotoVolumeAndLocalId: the variant carries everything it needs
const ERA_32: PhotoSizeSource[] = [
  { type: 'thumbnail', fileType: 2, thumbnailType: 'm' },
  { type: 'dialog_photo_small', dialogId: 2n, dialogAccessHash: 3n },
  { type: 'dialog_photo_big', dialogId: 2n, dialogAccessHash: 3n },
  { type: 'sticker_set_thumbnail', stickerSetId: 2n, stickerSetAccessHash: 3n },
  { type: 'full_legacy', volumeId: 1n, secret: 2n, localId: 3 },
  { type: 'dialog_photo_small_legacy', dialogId: 2n, dialogAccessHash: 3n, volumeId: 1n, localId: 4 },
  { type: 'dialog_photo_big_legacy', dialogId: 2n, dialogAccessHash: 3n, volumeId: 1n, localId: 4 },
  { type: 'sticker_set_thumbnail_legacy', stickerSetId: 2n, stickerSetAccessHash: 3n, volumeId: 1n, localId: 4 },
  { type: 'sticker_set_thumbnail_version', stickerSetId: 2n, stickerSetAccessHash: 3n, version: 5 }
]

describe('PhotoSizeSource round-trip', () => {
  for (const sample of PRE_22) {
    it(`round-trips ${sample.type} (v2)`, () => {
      expect(roundTrip(sample, 2, 0)).toEqual(sample)
    })
  }

  for (const sample of ERA_22) {
    it(`round-trips ${sample.type} (v4.22)`, () => {
      expect(roundTrip(sample, 4, 22)).toEqual(sample)
    })
  }

  for (const sample of ERA_32) {
    it(`round-trips ${sample.type} (v4.32)`, () => {
      expect(roundTrip(sample, 4, 32)).toEqual(sample)
    })
  }

  it('drops the outer volume_id and local_id once sub_version reaches 32', () => {
    const source: PhotoSizeSource = {
      type: 'dialog_photo_big',
      volumeId: 1n,
      dialogId: 2n,
      dialogAccessHash: 3n,
      localId: 4
    }

    const era22 = new BinaryWriter()
    const era32 = new BinaryWriter()

    serializePhotoSizeSource(era22, source, 4, 22)
    serializePhotoSizeSource(era32, source, 4, 32)

    expect(era22.toBytes().byteLength - era32.toBytes().byteLength).toBe(12)
  })

  it('refuses a non-legacy source on the pre-22 layout', () => {
    const writer = new BinaryWriter()
    const source: PhotoSizeSource = { type: 'thumbnail', fileType: 2, thumbnailType: 'x' }

    expect(() => serializePhotoSizeSource(writer, source, 4, 21)).toThrow()
  })
})
