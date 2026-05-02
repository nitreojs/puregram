import type { FileType } from '../constants'

// pre-`RemovePhotoVolumeAndLocalId` (sub_version 32) photos carried volume_id/local_id outside
// the variant. modern file_ids drop them, so they're optional on variants that don't carry their own
export interface LegacyPhotoSizeSource {
  type: 'legacy'
  volumeId?: bigint
  secret: bigint
  localId: number
}

export interface ThumbnailPhotoSizeSource {
  type: 'thumbnail'
  volumeId?: bigint
  fileType: FileType
  thumbnailType: string
  localId?: number
}

export interface DialogPhotoSmallPhotoSizeSource {
  type: 'dialog_photo_small'
  volumeId?: bigint
  dialogId: bigint
  dialogAccessHash: bigint
  localId?: number
}

export interface DialogPhotoBigPhotoSizeSource {
  type: 'dialog_photo_big'
  volumeId?: bigint
  dialogId: bigint
  dialogAccessHash: bigint
  localId?: number
}

export interface StickerSetThumbnailPhotoSizeSource {
  type: 'sticker_set_thumbnail'
  volumeId?: bigint
  stickerSetId: bigint
  stickerSetAccessHash: bigint
  localId?: number
}

// variants TDLib added once volume_id/local_id moved inside the source instead of outside

export interface FullLegacyPhotoSizeSource {
  type: 'full_legacy'
  volumeId: bigint
  secret: bigint
  localId: number
}

export interface DialogPhotoSmallLegacyPhotoSizeSource {
  type: 'dialog_photo_small_legacy'
  dialogId: bigint
  dialogAccessHash: bigint
  volumeId: bigint
  localId: number
}

export interface DialogPhotoBigLegacyPhotoSizeSource {
  type: 'dialog_photo_big_legacy'
  dialogId: bigint
  dialogAccessHash: bigint
  volumeId: bigint
  localId: number
}

export interface StickerSetThumbnailLegacyPhotoSizeSource {
  type: 'sticker_set_thumbnail_legacy'
  stickerSetId: bigint
  stickerSetAccessHash: bigint
  volumeId: bigint
  localId: number
}

export interface StickerSetThumbnailVersionPhotoSizeSource {
  type: 'sticker_set_thumbnail_version'
  stickerSetId: bigint
  stickerSetAccessHash: bigint
  version: number
}

export type PhotoSizeSource =
  | LegacyPhotoSizeSource
  | ThumbnailPhotoSizeSource
  | DialogPhotoSmallPhotoSizeSource
  | DialogPhotoBigPhotoSizeSource
  | StickerSetThumbnailPhotoSizeSource
  | FullLegacyPhotoSizeSource
  | DialogPhotoSmallLegacyPhotoSizeSource
  | DialogPhotoBigLegacyPhotoSizeSource
  | StickerSetThumbnailLegacyPhotoSizeSource
  | StickerSetThumbnailVersionPhotoSizeSource
