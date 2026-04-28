interface BaseFileUniqueId {
  source: string
}

export interface WebFileUniqueId extends BaseFileUniqueId {
  kind: 'web'
  url: string
}

export interface PhotoFileUniqueId extends BaseFileUniqueId {
  kind: 'photo'
  volumeId: bigint
  localId: number
}

export interface DocumentFileUniqueId extends BaseFileUniqueId {
  kind: 'document'
  id: bigint
}

export interface SecureFileUniqueId extends BaseFileUniqueId {
  kind: 'secure'
  id: bigint
}

export interface EncryptedFileUniqueId extends BaseFileUniqueId {
  kind: 'encrypted'
  id: bigint
}

export interface TempFileUniqueId extends BaseFileUniqueId {
  kind: 'temp'
  id: bigint
}

export type ParsedFileUniqueId =
  | WebFileUniqueId
  | PhotoFileUniqueId
  | DocumentFileUniqueId
  | SecureFileUniqueId
  | EncryptedFileUniqueId
  | TempFileUniqueId
