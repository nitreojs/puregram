import {
  type FileType,
  PhotoSizeSourceType,
  VERSION_ADD_PHOTO_SIZE_SOURCE,
  VERSION_REMOVE_PHOTO_VOLUME_AND_LOCAL_ID
} from '../constants'
import type { BinaryReader } from '../encoding/reader'
import { FileIdParseError } from '../errors'

import type { PhotoSizeSource } from './types'

// telegram thumbnail_type is a single ASCII char serialized as int32 (4 bytes,
// LSB first). decode the printable prefix and trim trailing nulls
function readThumbnailType (reader: BinaryReader) {
  const charBytes = reader.readBytes(4)
  const firstZero = charBytes.indexOf(0)
  const sliceEnd = firstZero === -1 ? charBytes.length : firstZero

  return new TextDecoder('utf-8').decode(charBytes.slice(0, sliceEnd))
}

// parse the variant body. `sourceType` is consumed by the caller; `outerVolumeId` /
// `outerLocalId` are only set on the pre-32 layout (era-32+ passes undefined, variant carries all)
function parseVariant (
  reader: BinaryReader,
  sourceType: PhotoSizeSourceType,
  outerVolumeId: bigint | undefined,
  consumeOuterLocalId: () => number | undefined
  // discriminant union needs explicit annotation so narrow inference at call sites works
  // eslint-disable-next-line local-rules/no-redundant-return-type
): PhotoSizeSource {
  switch (sourceType) {
    case PhotoSizeSourceType.Legacy: {
      const secret = reader.readI64()
      const localId = consumeOuterLocalId() ?? 0

      return {
        type: 'legacy',
        ...(outerVolumeId !== undefined ? { volumeId: outerVolumeId } : {}),
        secret,
        localId
      }
    }

    case PhotoSizeSourceType.Thumbnail: {
      const fileType = reader.readU32() as FileType
      const thumbnailType = readThumbnailType(reader)
      const localId = consumeOuterLocalId()

      return {
        type: 'thumbnail',
        ...(outerVolumeId !== undefined ? { volumeId: outerVolumeId } : {}),
        fileType,
        thumbnailType,
        ...(localId !== undefined ? { localId } : {})
      }
    }

    case PhotoSizeSourceType.DialogPhotoSmall:
    case PhotoSizeSourceType.DialogPhotoBig: {
      const dialogId = reader.readI64()
      const dialogAccessHash = reader.readI64()
      const localId = consumeOuterLocalId()
      const type = sourceType === PhotoSizeSourceType.DialogPhotoSmall
        ? 'dialog_photo_small' as const
        : 'dialog_photo_big' as const

      return {
        type,
        ...(outerVolumeId !== undefined ? { volumeId: outerVolumeId } : {}),
        dialogId,
        dialogAccessHash,
        ...(localId !== undefined ? { localId } : {})
      }
    }

    case PhotoSizeSourceType.StickerSetThumbnail: {
      const stickerSetId = reader.readI64()
      const stickerSetAccessHash = reader.readI64()
      const localId = consumeOuterLocalId()

      return {
        type: 'sticker_set_thumbnail',
        ...(outerVolumeId !== undefined ? { volumeId: outerVolumeId } : {}),
        stickerSetId,
        stickerSetAccessHash,
        ...(localId !== undefined ? { localId } : {})
      }
    }

    case PhotoSizeSourceType.FullLegacy: {
      const volumeId = reader.readI64()
      const secret = reader.readI64()
      const localId = reader.readI32()

      return { type: 'full_legacy', volumeId, secret, localId }
    }

    case PhotoSizeSourceType.DialogPhotoSmallLegacy:
    case PhotoSizeSourceType.DialogPhotoBigLegacy: {
      const dialogId = reader.readI64()
      const dialogAccessHash = reader.readI64()
      const volumeId = reader.readI64()
      const localId = reader.readI32()
      const type = sourceType === PhotoSizeSourceType.DialogPhotoSmallLegacy
        ? 'dialog_photo_small_legacy' as const
        : 'dialog_photo_big_legacy' as const

      return { type, dialogId, dialogAccessHash, volumeId, localId }
    }

    case PhotoSizeSourceType.StickerSetThumbnailLegacy: {
      const stickerSetId = reader.readI64()
      const stickerSetAccessHash = reader.readI64()
      const volumeId = reader.readI64()
      const localId = reader.readI32()

      return {
        type: 'sticker_set_thumbnail_legacy',
        stickerSetId,
        stickerSetAccessHash,
        volumeId,
        localId
      }
    }

    case PhotoSizeSourceType.StickerSetThumbnailVersion: {
      const stickerSetId = reader.readI64()
      const stickerSetAccessHash = reader.readI64()
      const version = reader.readI32()

      return {
        type: 'sticker_set_thumbnail_version',
        stickerSetId,
        stickerSetAccessHash,
        version
      }
    }

    default:
      throw new FileIdParseError(`unknown photo size source type ${sourceType as number}`)
  }
}

export function parsePhotoSizeSource (
  reader: BinaryReader,
  version: number,
  subVersion: number
  // discriminant union needs explicit annotation so narrow inference at call sites works
  // eslint-disable-next-line local-rules/no-redundant-return-type
): PhotoSizeSource {
  // pre-AddPhotoSizeSource: implicit FullLegacy { volume_id, secret, local_id }
  if (version < 4 || subVersion < VERSION_ADD_PHOTO_SIZE_SOURCE) {
    const volumeId = reader.readI64()
    const secret = reader.readI64()
    const localId = reader.readI32()

    return {
      type: 'legacy',
      volumeId,
      secret,
      localId
    }
  }

  // RemovePhotoVolumeAndLocalId era — variant carries everything (modern layout used by Telegram Desktop)
  if (subVersion >= VERSION_REMOVE_PHOTO_VOLUME_AND_LOCAL_ID) {
    const sourceType = reader.readU32() as PhotoSizeSourceType

    return parseVariant(reader, sourceType, undefined, () => undefined)
  }

  // AddPhotoSizeSource era: outer volume_id, then variant tag + variant body, then outer local_id
  const outerVolumeId = reader.readI64()
  const sourceType = reader.readU32() as PhotoSizeSourceType
  let outerLocalIdRead = false
  let outerLocalId = 0

  const consumeOuterLocalId = () => {
    if (outerLocalIdRead) {
      return outerLocalId
    }

    outerLocalIdRead = true
    outerLocalId = reader.readI32()

    return outerLocalId
  }

  return parseVariant(reader, sourceType, outerVolumeId, consumeOuterLocalId)
}
