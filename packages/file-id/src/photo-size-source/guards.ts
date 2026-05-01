import type {
  DialogPhotoBigLegacyPhotoSizeSource,
  DialogPhotoBigPhotoSizeSource,
  DialogPhotoSmallLegacyPhotoSizeSource,
  DialogPhotoSmallPhotoSizeSource,
  FullLegacyPhotoSizeSource,
  LegacyPhotoSizeSource,
  PhotoSizeSource,
  StickerSetThumbnailLegacyPhotoSizeSource,
  StickerSetThumbnailPhotoSizeSource,
  StickerSetThumbnailVersionPhotoSizeSource,
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

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isFullLegacySource (source: PhotoSizeSource): source is FullLegacyPhotoSizeSource {
  return source.type === 'full_legacy'
}

export function isDialogPhotoSmallLegacySource (
  source: PhotoSizeSource
  // eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
): source is DialogPhotoSmallLegacyPhotoSizeSource {
  return source.type === 'dialog_photo_small_legacy'
}

export function isDialogPhotoBigLegacySource (
  source: PhotoSizeSource
  // eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
): source is DialogPhotoBigLegacyPhotoSizeSource {
  return source.type === 'dialog_photo_big_legacy'
}

export function isStickerSetThumbnailLegacySource (
  source: PhotoSizeSource
  // eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
): source is StickerSetThumbnailLegacyPhotoSizeSource {
  return source.type === 'sticker_set_thumbnail_legacy'
}

export function isStickerSetThumbnailVersionSource (
  source: PhotoSizeSource
  // eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
): source is StickerSetThumbnailVersionPhotoSizeSource {
  return source.type === 'sticker_set_thumbnail_version'
}
