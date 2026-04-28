import type { FileType } from '../constants'
import type { PhotoSizeSource } from '../photo-size-source/types'

interface BaseFileId {
  source: string
  version: number
  subVersion: number
  fileType: FileType
  dcId: number
  fileReference?: Uint8Array
}

export interface PhotoFileId extends BaseFileId {
  kind: 'photo'
  fileType: FileType.Thumbnail | FileType.ProfilePhoto | FileType.Photo
  id: bigint
  accessHash: bigint
  photoSize: PhotoSizeSource
}

export interface DocumentFileId extends BaseFileId {
  kind: 'document'
  id: bigint
  accessHash: bigint
}

export interface WebFileId extends BaseFileId {
  kind: 'web'
  url: string
  accessHash: bigint
}

export type ParsedFileId = PhotoFileId | DocumentFileId | WebFileId
