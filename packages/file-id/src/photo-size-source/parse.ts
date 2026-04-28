import { type FileType, PhotoSizeSourceType } from '../constants'
import type { BinaryReader } from '../encoding/reader'
import { FileIdParseError } from '../errors'

export function parsePhotoSizeSource (reader: BinaryReader, version: number) {
  const volumeId = reader.readI64()

  // v2 file_ids omit the source-type byte and are implicitly Legacy
  const sourceType: PhotoSizeSourceType = version >= 4 ? reader.readU32() : PhotoSizeSourceType.Legacy

  switch (sourceType) {
    case PhotoSizeSourceType.Legacy: {
      const secret = reader.readI64()
      const localId = reader.readI32()

      return { type: 'legacy' as const, volumeId, secret, localId }
    }

    case PhotoSizeSourceType.Thumbnail: {
      const rawFileType = reader.readU32()
      const charBytes = reader.readBytes(4)
      const firstZero = charBytes.indexOf(0)
      const sliceEnd = firstZero === -1 ? charBytes.length : firstZero
      const thumbnailType = new TextDecoder('utf-8').decode(charBytes.slice(0, sliceEnd))
      const localId = reader.readI32()

      return {
        type: 'thumbnail' as const,
        volumeId,
        fileType: rawFileType as FileType,
        thumbnailType,
        localId
      }
    }

    case PhotoSizeSourceType.DialogPhotoSmall:
    case PhotoSizeSourceType.DialogPhotoBig: {
      const dialogId = reader.readI64()
      const dialogAccessHash = reader.readI64()
      const localId = reader.readI32()
      const type = sourceType === PhotoSizeSourceType.DialogPhotoSmall
        ? ('dialog_photo_small' as const)
        : ('dialog_photo_big' as const)

      return { type, volumeId, dialogId, dialogAccessHash, localId }
    }

    case PhotoSizeSourceType.StickerSetThumbnail: {
      const stickerSetId = reader.readI64()
      const stickerSetAccessHash = reader.readI64()
      const localId = reader.readI32()

      return {
        type: 'sticker_set_thumbnail' as const,
        volumeId,
        stickerSetId,
        stickerSetAccessHash,
        localId
      }
    }

    default:
      throw new FileIdParseError(`unknown photo size source type ${sourceType as number}`)
  }
}
