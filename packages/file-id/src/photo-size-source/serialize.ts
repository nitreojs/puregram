import {
  PhotoSizeSourceType,
  VERSION_ADD_PHOTO_SIZE_SOURCE,
  VERSION_REMOVE_PHOTO_VOLUME_AND_LOCAL_ID
} from '../constants'
import type { BinaryWriter } from '../encoding/reader'

import type { PhotoSizeSource } from './types'

function sourceTypeOf (source: PhotoSizeSource) {
  switch (source.type) {
    case 'legacy': return PhotoSizeSourceType.Legacy
    case 'thumbnail': return PhotoSizeSourceType.Thumbnail
    case 'dialog_photo_small': return PhotoSizeSourceType.DialogPhotoSmall
    case 'dialog_photo_big': return PhotoSizeSourceType.DialogPhotoBig
    case 'sticker_set_thumbnail': return PhotoSizeSourceType.StickerSetThumbnail
    case 'full_legacy': return PhotoSizeSourceType.FullLegacy
    case 'dialog_photo_small_legacy': return PhotoSizeSourceType.DialogPhotoSmallLegacy
    case 'dialog_photo_big_legacy': return PhotoSizeSourceType.DialogPhotoBigLegacy
    case 'sticker_set_thumbnail_legacy': return PhotoSizeSourceType.StickerSetThumbnailLegacy
    case 'sticker_set_thumbnail_version': return PhotoSizeSourceType.StickerSetThumbnailVersion
  }
}

function writeThumbnailType (writer: BinaryWriter, thumbnailType: string) {
  const charBytes = new TextEncoder().encode(thumbnailType)
  const padded = new Uint8Array(4)

  padded.set(charBytes.subarray(0, Math.min(charBytes.byteLength, 4)))
  writer.writeBytes(padded)
}

export function serializePhotoSizeSource (
  writer: BinaryWriter,
  source: PhotoSizeSource,
  version: number,
  subVersion: number
) {
  // pre-AddPhotoSizeSource: implicit FullLegacy { volume_id, secret, local_id }
  if (version < 4 || subVersion < VERSION_ADD_PHOTO_SIZE_SOURCE) {
    if (source.type !== 'legacy' && source.type !== 'full_legacy') {
      throw new Error(`pre-${VERSION_ADD_PHOTO_SIZE_SOURCE} layout only supports legacy/full_legacy sources`)
    }

    const volumeId = source.type === 'full_legacy' ? source.volumeId : (source.volumeId ?? 0n)

    writer.writeI64(volumeId)
    writer.writeI64(source.secret)
    writer.writeI32(source.localId)

    return
  }

  const isModern = subVersion >= VERSION_REMOVE_PHOTO_VOLUME_AND_LOCAL_ID

  // pre-32 layout has an outer volume_id before the source tag
  if (!isModern) {
    if (!('volumeId' in source) || source.volumeId === undefined) {
      throw new Error(`source.volumeId required for sub_version < ${VERSION_REMOVE_PHOTO_VOLUME_AND_LOCAL_ID}`)
    }

    writer.writeI64(source.volumeId)
  }

  writer.writeU32(sourceTypeOf(source))

  switch (source.type) {
    case 'legacy':
      writer.writeI64(source.secret)
      // outer local_id (pre-32 layout); for modern layout this is unreachable
      // (legacy is converted to full_legacy on parse)
      writer.writeI32(source.localId)

      return

    case 'thumbnail': {
      writer.writeU32(source.fileType)
      writeThumbnailType(writer, source.thumbnailType)

      if (!isModern) {
        writer.writeI32(source.localId ?? 0)
      }

      return
    }

    case 'dialog_photo_small':
    case 'dialog_photo_big':
      writer.writeI64(source.dialogId)
      writer.writeI64(source.dialogAccessHash)

      if (!isModern) {
        writer.writeI32(source.localId ?? 0)
      }

      return

    case 'sticker_set_thumbnail':
      writer.writeI64(source.stickerSetId)
      writer.writeI64(source.stickerSetAccessHash)

      if (!isModern) {
        writer.writeI32(source.localId ?? 0)
      }

      return

    case 'full_legacy':
      writer.writeI64(source.volumeId)
      writer.writeI64(source.secret)
      writer.writeI32(source.localId)

      return

    case 'dialog_photo_small_legacy':
    case 'dialog_photo_big_legacy':
      writer.writeI64(source.dialogId)
      writer.writeI64(source.dialogAccessHash)
      writer.writeI64(source.volumeId)
      writer.writeI32(source.localId)

      return

    case 'sticker_set_thumbnail_legacy':
      writer.writeI64(source.stickerSetId)
      writer.writeI64(source.stickerSetAccessHash)
      writer.writeI64(source.volumeId)
      writer.writeI32(source.localId)

      return

    case 'sticker_set_thumbnail_version':
      writer.writeI64(source.stickerSetId)
      writer.writeI64(source.stickerSetAccessHash)
      writer.writeI32(source.version)
  }
}
