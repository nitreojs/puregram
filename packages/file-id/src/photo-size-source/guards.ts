import type {
  DialogPhotoBigPhotoSizeSource,
  DialogPhotoSmallPhotoSizeSource,
  LegacyPhotoSizeSource,
  PhotoSizeSource,
  StickerSetThumbnailPhotoSizeSource,
  ThumbnailPhotoSizeSource
} from './types'

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isLegacySource (source: PhotoSizeSource): source is LegacyPhotoSizeSource {
  return source.type === 'legacy'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isThumbnailSource (source: PhotoSizeSource): source is ThumbnailPhotoSizeSource {
  return source.type === 'thumbnail'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isDialogPhotoSmallSource (source: PhotoSizeSource): source is DialogPhotoSmallPhotoSizeSource {
  return source.type === 'dialog_photo_small'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isDialogPhotoBigSource (source: PhotoSizeSource): source is DialogPhotoBigPhotoSizeSource {
  return source.type === 'dialog_photo_big'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isStickerSetThumbnailSource (source: PhotoSizeSource): source is StickerSetThumbnailPhotoSizeSource {
  return source.type === 'sticker_set_thumbnail'
}
