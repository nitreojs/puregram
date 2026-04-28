import type { FileType } from '../constants'

export interface LegacyPhotoSizeSource {
  type: 'legacy'
  volumeId: bigint
  secret: bigint
  localId: number
}

export interface ThumbnailPhotoSizeSource {
  type: 'thumbnail'
  volumeId: bigint
  fileType: FileType
  thumbnailType: string
  localId: number
}

export interface DialogPhotoSmallPhotoSizeSource {
  type: 'dialog_photo_small'
  volumeId: bigint
  dialogId: bigint
  dialogAccessHash: bigint
  localId: number
}

export interface DialogPhotoBigPhotoSizeSource {
  type: 'dialog_photo_big'
  volumeId: bigint
  dialogId: bigint
  dialogAccessHash: bigint
  localId: number
}

export interface StickerSetThumbnailPhotoSizeSource {
  type: 'sticker_set_thumbnail'
  volumeId: bigint
  stickerSetId: bigint
  stickerSetAccessHash: bigint
  localId: number
}

export type PhotoSizeSource =
  | LegacyPhotoSizeSource
  | ThumbnailPhotoSizeSource
  | DialogPhotoSmallPhotoSizeSource
  | DialogPhotoBigPhotoSizeSource
  | StickerSetThumbnailPhotoSizeSource
