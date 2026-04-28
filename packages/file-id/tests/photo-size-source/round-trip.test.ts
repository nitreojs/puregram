import { describe, expect, it } from 'vitest'

import { BinaryReader, BinaryWriter } from '../../src/encoding/reader'
import { parsePhotoSizeSource } from '../../src/photo-size-source/parse'
import { serializePhotoSizeSource } from '../../src/photo-size-source/serialize'
import type { PhotoSizeSource } from '../../src/photo-size-source/types'

const samples: PhotoSizeSource[] = [
  { type: 'legacy', volumeId: 257017715n, secret: 8510641140621971213n, localId: 110700 },
  { type: 'thumbnail', volumeId: 257017715n, fileType: 2, thumbnailType: 'x', localId: 110699 },
  { type: 'dialog_photo_small', volumeId: 1n, dialogId: 2n, dialogAccessHash: 3n, localId: 4 },
  { type: 'dialog_photo_big', volumeId: 1n, dialogId: 2n, dialogAccessHash: 3n, localId: 4 },
  { type: 'sticker_set_thumbnail', volumeId: 1n, stickerSetId: 2n, stickerSetAccessHash: 3n, localId: 4 }
]

describe('PhotoSizeSource round-trip', () => {
  for (const sample of samples) {
    it(`round-trips ${sample.type} (v4)`, () => {
      const writer = new BinaryWriter()

      serializePhotoSizeSource(writer, sample, 4)

      const reader = new BinaryReader(writer.toBytes())
      const parsed = parsePhotoSizeSource(reader, 4)

      expect(parsed).toEqual(sample)
      expect(reader.remaining).toBe(0)
    })
  }

  it('v2 reads/writes Legacy without source-type byte', () => {
    const sample = samples[0]
    const writer = new BinaryWriter()

    serializePhotoSizeSource(writer, sample, 2)

    const reader = new BinaryReader(writer.toBytes())
    const parsed = parsePhotoSizeSource(reader, 2)

    expect(parsed).toEqual(sample)
    expect(reader.remaining).toBe(0)
  })
})
