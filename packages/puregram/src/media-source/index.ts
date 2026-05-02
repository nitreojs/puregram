import { Readable } from 'node:stream'

import { File } from 'formdata-node'

/** discriminator for `MediaInput` envelopes */
export enum MediaSourceType {
  Path = 'path',
  Url = 'url',
  FileId = 'file_id',
  Buffer = 'buffer',
  Stream = 'stream',
  File = 'file',
  ArrayBuffer = 'array_buffer'
}

/** options shared by every `MediaSource.X(...)` factory */
export interface MediaInputOptions {
  filename?: string
}

/** url-only options — `forceUpload` makes puregram fetch the url and upload its bytes directly */
export interface MediaInputUrlOptions {
  forceUpload?: boolean
}

interface Base extends MediaInputOptions {
  type: MediaSourceType
}

/** local-file upload envelope */
export interface MediaSourcePath extends Base {
 type: MediaSourceType.Path; value: string
}
/** url upload envelope (telegram fetches it, unless `forceUpload` is set) */
export interface MediaSourceUrl extends Base, MediaInputUrlOptions {
 type: MediaSourceType.Url; value: string
}
/** existing-on-server reference envelope */
export interface MediaSourceFileId extends Base {
 type: MediaSourceType.FileId; value: string
}
/** in-memory bytes envelope */
export interface MediaSourceBuffer extends Base {
 type: MediaSourceType.Buffer; value: Buffer
}
/** stream upload envelope */
export interface MediaSourceStream extends Base {
 type: MediaSourceType.Stream; value: Readable
}
/** WHATWG `File` envelope */
export interface MediaSourceFile extends Base {
 type: MediaSourceType.File; value: File
}
/** raw `ArrayBuffer` envelope */
export interface MediaSourceArrayBuffer extends Base {
 type: MediaSourceType.ArrayBuffer; value: ArrayBufferLike
}

/** discriminated union of every `MediaSource.X(...)` return value */
export type MediaInput =
  | MediaSourcePath | MediaSourceUrl | MediaSourceFileId
  | MediaSourceBuffer | MediaSourceStream | MediaSourceFile | MediaSourceArrayBuffer

function typeError (field: string, expected: string, value: unknown) {
  return new TypeError(`expected '${field}' to be ${expected}, found ${typeof value}`)
}

/**
 * Static factories for the various ways media can be uploaded to the bot api
 *
 * @example
 * ```ts
 * tg.api.sendDocument({
 *   chat_id: CHAT_ID,
 *   document: MediaSource.buffer(catBuffer, { filename: 'cat.png' })
 * })
 * ```
 */
export class MediaSource {
  /**
   * upload a local file by absolute or relative path
   *
   * @example
   * ```ts
   * update.sendPhoto(MediaSource.path('./cat.png'))
   * ```
   */
  static path (path: string, opts: MediaInputOptions = {}): MediaSourcePath {
    if (typeof path !== 'string') {
      throw typeError('path', 'string', path)
    }

    return { type: MediaSourceType.Path, value: path, ...opts }
  }

  /**
   * upload from a url. by default telegram fetches the url itself, which only
   * works for gif/pdf/zip on `sendDocument`. set `forceUpload: true` to make
   * puregram fetch the bytes and upload them as multipart instead
   *
   * @example
   * ```ts
   * update.sendDocument(MediaSource.url(catUrl), { forceUpload: true, filename: 'cat.png' })
   * ```
   */
  static url (url: string, opts: MediaInputOptions & MediaInputUrlOptions = {}): MediaSourceUrl {
    if (typeof url !== 'string') {
      throw typeError('url', 'string', url)
    }

    return { type: MediaSourceType.Url, value: url, ...opts }
  }

  /**
   * reference an already-uploaded file by `file_id`
   *
   * @example
   * ```ts
   * update.sendPhoto(MediaSource.fileId(savedFileId))
   * ```
   */
  static fileId (id: string, opts: MediaInputOptions = {}): MediaSourceFileId {
    if (typeof id !== 'string') {
      throw typeError('fileId', 'string', id)
    }

    return { type: MediaSourceType.FileId, value: id, ...opts }
  }

  /**
   * upload an in-memory buffer
   *
   * @example
   * ```ts
   * update.sendMediaGroup(buffers.map(b => InputMedia.photo({ media: MediaSource.buffer(b) })))
   * ```
   */
  static buffer (buffer: Buffer, opts: MediaInputOptions = {}): MediaSourceBuffer {
    if (!Buffer.isBuffer(buffer)) {
      throw typeError('buffer', 'Buffer', buffer)
    }

    return { type: MediaSourceType.Buffer, value: buffer, ...opts }
  }

  /**
   * upload from a node `Readable` stream
   *
   * @example
   * ```ts
   * update.sendDocument(MediaSource.stream(createReadStream('./big-file.bin')))
   * ```
   */
  static stream (stream: Readable, opts: MediaInputOptions = {}): MediaSourceStream {
    if (!(stream instanceof Readable)) {
      throw typeError('stream', 'Readable', stream)
    }

    return { type: MediaSourceType.Stream, value: stream, ...opts }
  }

  /**
   * upload a WHATWG `File`
   *
   * @example
   * ```ts
   * const ab = await response.arrayBuffer()
   * update.sendDocument(MediaSource.file(new File([ab], 'cat.png')))
   * ```
   */
  static file (file: File, opts: MediaInputOptions = {}): MediaSourceFile {
    if (!(file instanceof File)) {
      throw typeError('file', 'File', file)
    }

    return { type: MediaSourceType.File, value: file, ...opts }
  }

  /**
   * upload from an `ArrayBuffer`/`SharedArrayBuffer`
   *
   * @example
   * ```ts
   * const ab = await response.arrayBuffer()
   * update.sendPhoto(MediaSource.arrayBuffer(ab))
   * ```
   */
  static arrayBuffer (buffer: ArrayBufferLike, opts: MediaInputOptions = {}) {
    if (!(buffer instanceof ArrayBuffer) && !(buffer instanceof SharedArrayBuffer)) {
      throw typeError('buffer', 'ArrayBuffer or SharedArrayBuffer', buffer)
    }

    return { type: MediaSourceType.ArrayBuffer, value: buffer, ...opts }
  }

  /**
   * upload from a base64 string. internally decoded to a `Buffer` since the bot
   * api has no native base64 upload form
   *
   * @example
   * ```ts
   * update.sendDocument(MediaSource.base64(await getBase64()))
   * ```
   */
  static base64 (b64: string, opts: MediaInputOptions = {}): MediaSourceBuffer {
    if (typeof b64 !== 'string') {
      throw typeError('b64', 'string', b64)
    }

    return MediaSource.buffer(Buffer.from(b64, 'base64'), opts)
  }
}

/** narrowing predicate for "is this a `MediaSource.X(...)` envelope" */
// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
export function isMediaInput (value: unknown): value is MediaInput {
  return typeof value === 'object' && value !== null && 'type' in value &&
    Object.values(MediaSourceType).includes((value as { type: MediaSourceType }).type)
}
