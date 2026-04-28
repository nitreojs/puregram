import type {
  DocumentFileUniqueId,
  EncryptedFileUniqueId,
  ParsedFileUniqueId,
  PhotoFileUniqueId,
  SecureFileUniqueId,
  TempFileUniqueId,
  WebFileUniqueId
} from './types'

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isWebUniqueId (u: ParsedFileUniqueId): u is WebFileUniqueId {
  return u.kind === 'web'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isPhotoUniqueId (u: ParsedFileUniqueId): u is PhotoFileUniqueId {
  return u.kind === 'photo'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isDocumentUniqueId (u: ParsedFileUniqueId): u is DocumentFileUniqueId {
  return u.kind === 'document'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isSecureUniqueId (u: ParsedFileUniqueId): u is SecureFileUniqueId {
  return u.kind === 'secure'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isEncryptedUniqueId (u: ParsedFileUniqueId): u is EncryptedFileUniqueId {
  return u.kind === 'encrypted'
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isTempUniqueId (u: ParsedFileUniqueId): u is TempFileUniqueId {
  return u.kind === 'temp'
}
