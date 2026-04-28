import { PhotoSizeSourceType } from '../constants'
import type { BinaryWriter } from '../encoding/reader'

import type { PhotoSizeSource } from './types'

function sourceTypeOf (source: PhotoSizeSource) {
  switch (source.type) {
    case 'legacy': return PhotoSizeSourceType.Legacy
    case 'thumbnail': return PhotoSizeSourceType.Thumbnail
    case 'dialog_photo_small': return PhotoSizeSourceType.DialogPhotoSmall
    case 'dialog_photo_big': return PhotoSizeSourceType.DialogPhotoBig
    case 'sticker_set_thumbnail': return PhotoSizeSourceType.StickerSetThumbnail
  }
}

export function serializePhotoSizeSource (writer: BinaryWriter, source: PhotoSizeSource, version: number) {
  writer.writeI64(source.volumeId)

  if (version >= 4) {
    writer.writeU32(sourceTypeOf(source))
  }

  switch (source.type) {
    case 'legacy':
      writer.writeI64(source.secret)
      writer.writeI32(source.localId)

      return

    case 'thumbnail': {
      writer.writeU32(source.fileType)

      const charBytes = new TextEncoder().encode(source.thumbnailType)
      const padded = new Uint8Array(4)

      padded.set(charBytes.subarray(0, Math.min(charBytes.byteLength, 4)))
      writer.writeBytes(padded)
      writer.writeI32(source.localId)

      return
    }

    case 'dialog_photo_small':
    case 'dialog_photo_big':
      writer.writeI64(source.dialogId)
      writer.writeI64(source.dialogAccessHash)
      writer.writeI32(source.localId)

      return

    case 'sticker_set_thumbnail':
      writer.writeI64(source.stickerSetId)
      writer.writeI64(source.stickerSetAccessHash)
      writer.writeI32(source.localId)
  }
}
