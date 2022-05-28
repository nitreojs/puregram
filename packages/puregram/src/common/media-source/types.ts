import { Readable } from 'node:stream'
import { File } from 'undici'

export interface MediaInputOptions {
  /** Sets custom file name */
  filename?: string
}

export interface MediaInputUrlOptions {
  /**
   * Tells `puregram` to fetch URL contents and upload them directly to Bot API
   * instead of passing raw URL as an end value
   */
  forceUpload?: boolean
}

export enum MediaSourceType {
  Path = 'path',
  Url = 'url',
  FileId = 'file_id',
  Buffer = 'buffer',
  Stream = 'stream',
  File = 'file',
  ArrayBuffer = 'array_buffer'
}

export interface MediaSourceBase extends MediaInputOptions {
  type: MediaSourceType
}

export interface MediaSourcePath extends MediaSourceBase {
  type: MediaSourceType.Path
  value: string
}

export interface MediaSourceUrl extends MediaSourceBase, MediaInputUrlOptions {
  type: MediaSourceType.Url
  value: string
}

export interface MediaSourceFileId extends MediaSourceBase {
  type: MediaSourceType.FileId
  value: string
}

export interface MediaSourceBuffer extends MediaSourceBase {
  type: MediaSourceType.Buffer
  value: Buffer
}

export interface MediaSourceStream extends MediaSourceBase {
  type: MediaSourceType.Stream
  value: Readable
}

export interface MediaSourceFile extends MediaSourceBase {
  type: MediaSourceType.File
  value: File
}

export interface MediaSourceArrayBuffer extends MediaSourceBase {
  type: MediaSourceType.ArrayBuffer
  value: ArrayBufferLike
}

export type MediaInput =
  | MediaSourcePath
  | MediaSourceUrl
  | MediaSourceFileId
  | MediaSourceBuffer
  | MediaSourceStream
  | MediaSourceFile
  | MediaSourceArrayBuffer
