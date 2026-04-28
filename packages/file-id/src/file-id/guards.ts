import { FileType } from '../constants'

import type { DocumentFileId, ParsedFileId, PhotoFileId, WebFileId } from './types'

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isPhotoFileId (file: ParsedFileId): file is PhotoFileId {
  return file.kind === 'photo'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isDocumentFileId (file: ParsedFileId): file is DocumentFileId {
  return file.kind === 'document'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isWebFileId (file: ParsedFileId): file is WebFileId {
  return file.kind === 'web'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isStickerFileId (file: ParsedFileId): file is DocumentFileId {
  return file.kind === 'document' && file.fileType === FileType.Sticker
}
