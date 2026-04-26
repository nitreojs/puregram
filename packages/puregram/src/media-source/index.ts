import type { Writable } from 'node:stream'
import { Readable } from 'node:stream'

import { File } from 'formdata-node'

export enum MediaSourceType {
  Path = 'path',
  Url = 'url',
  FileId = 'file_id',
  Buffer = 'buffer',
  Stream = 'stream',
  File = 'file',
  ArrayBuffer = 'array_buffer'
}

export interface MediaInputOptions {
  filename?: string
}

export interface MediaInputUrlOptions {
  forceUpload?: boolean
}

interface Base extends MediaInputOptions {
  type: MediaSourceType
}

export interface MediaSourcePath extends Base {
 type: MediaSourceType.Path; value: string
}
export interface MediaSourceUrl extends Base, MediaInputUrlOptions {
 type: MediaSourceType.Url; value: string
}
export interface MediaSourceFileId extends Base {
 type: MediaSourceType.FileId; value: string
}
export interface MediaSourceBuffer extends Base {
 type: MediaSourceType.Buffer; value: Buffer
}
export interface MediaSourceStream extends Base {
 type: MediaSourceType.Stream; value: Readable
}
export interface MediaSourceFile extends Base {
 type: MediaSourceType.File; value: File
}
export interface MediaSourceArrayBuffer extends Base {
 type: MediaSourceType.ArrayBuffer; value: ArrayBufferLike
}

export type MediaInput =
  | MediaSourcePath | MediaSourceUrl | MediaSourceFileId
  | MediaSourceBuffer | MediaSourceStream | MediaSourceFile | MediaSourceArrayBuffer

export interface MediaSourceToPath extends Base {
 type: MediaSourceType.Path; value: string
}
export interface MediaSourceToBuffer extends Base {
 type: MediaSourceType.Buffer
}
export interface MediaSourceToStream extends Base {
 type: MediaSourceType.Stream; value: Writable
}

export type MediaInputTo = MediaSourceToPath | MediaSourceToBuffer | MediaSourceToStream

export class MediaSource {
  static path (path: string, opts: MediaInputOptions = {}): MediaSourcePath {
    if (typeof path !== 'string') {
      throw new TypeError('expected path: string')
    }

    return { type: MediaSourceType.Path, value: path, ...opts }
  }

  static url (url: string, opts: MediaInputOptions & MediaInputUrlOptions = {}): MediaSourceUrl {
    if (typeof url !== 'string') {
      throw new TypeError('expected url: string')
    }

    return { type: MediaSourceType.Url, value: url, ...opts }
  }

  static fileId (id: string, opts: MediaInputOptions = {}): MediaSourceFileId {
    if (typeof id !== 'string') {
      throw new TypeError('expected fileId: string')
    }

    return { type: MediaSourceType.FileId, value: id, ...opts }
  }

  static buffer (buffer: Buffer, opts: MediaInputOptions = {}): MediaSourceBuffer {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('expected buffer: Buffer')
    }

    return { type: MediaSourceType.Buffer, value: buffer, ...opts }
  }

  static stream (stream: Readable, opts: MediaInputOptions = {}): MediaSourceStream {
    if (!(stream instanceof Readable)) {
      throw new TypeError('expected stream: Readable')
    }

    return { type: MediaSourceType.Stream, value: stream, ...opts }
  }

  static file (file: File, opts: MediaInputOptions = {}): MediaSourceFile {
    if (!(file instanceof File)) {
      throw new TypeError('expected file: File')
    }

    return { type: MediaSourceType.File, value: file, ...opts }
  }

  static arrayBuffer (buffer: ArrayBufferLike, opts: MediaInputOptions = {}) {
    if (!(buffer instanceof ArrayBuffer) && !(buffer instanceof SharedArrayBuffer)) {
      throw new TypeError('expected buffer: ArrayBufferLike')
    }

    return { type: MediaSourceType.ArrayBuffer, value: buffer, ...opts }
  }

  static base64 (b64: string, opts: MediaInputOptions = {}): MediaSourceBuffer {
    if (typeof b64 !== 'string') {
      throw new TypeError('expected b64: string')
    }

    return MediaSource.buffer(Buffer.from(b64, 'base64'), opts)
  }
}

export class MediaSourceTo {
  static path (path: string, opts: MediaInputOptions = {}): MediaSourceToPath {
    return { type: MediaSourceType.Path, value: path, ...opts }
  }

  static buffer (opts: MediaInputOptions = {}) {
    return { type: MediaSourceType.Buffer, ...opts }
  }

  static stream (stream: Writable, opts: MediaInputOptions = {}): MediaSourceToStream {
    return { type: MediaSourceType.Stream, value: stream, ...opts }
  }
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isMediaInput (value: unknown): value is MediaInput {
  return typeof value === 'object' && value !== null && 'type' in value &&
    Object.values(MediaSourceType).includes((value as { type: MediaSourceType }).type)
}
