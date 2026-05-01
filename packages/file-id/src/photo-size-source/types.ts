import type { FileType } from '../constants'

// volumeId/localId are present on photo file_ids written before TDLib's
// `RemovePhotoVolumeAndLocalId` (sub_version 32). modern file_ids omit them
// from the outer location entirely, so they're optional on every variant
// that doesn't carry its own volume_id/local_id inside the variant
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

// new variants introduced once TDLib moved volume_id / local_id inside the
// source variants instead of carrying them outside the source

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
