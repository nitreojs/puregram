import { Readable, Writable } from 'node:stream'

import { File } from 'undici'

import { MediaInputOptions, MediaInputUrlOptions, MediaSourceArrayBuffer, MediaSourceBuffer, MediaSourceFile, MediaSourceFileId, MediaSourcePath, MediaSourceStream, MediaSourceToBuffer, MediaSourceToPath, MediaSourceToStream, MediaSourceType, MediaSourceUrl } from './types'

/**
 * This object includes static methods which you can use to upload media
 *
 * @example
 * ```js
 * telegram.api.sendDocument({
 *   chat_id: CHAT_ID,
 *   document: MediaSource.buffer(FUNNY_CAT_BUFFERED, { filename: 'funny-cat.png' })
 * })
 * ```
 */
export class MediaSource {
  /**
   * Use this static method for uploading a local file by passing an absolute/relative path to it
   *
   * @example
   * ```js
   * context.sendPhoto(MediaSource.path('./funny-cat.png'))
   * ```
   */
  static path (path: string, options: MediaInputOptions = {}): MediaSourcePath {
    if (typeof path !== 'string') {
      throw new TypeError(`expected 'path' to be string, found ${typeof path}`)
    }

    return {
      type: MediaSourceType.Path,
      value: path,
      ...options
    }
  }

  /**
   * Use this static method for uploading media by passing a URL to it
   *
   * One thing you might not be aware of: Telegram Bot API allows you to pass URL without
   * you manually downloading content from it and uploading it directly to Bot API.
   * The only problem is for example `sendDocument` accepts URL values only if it is either
   * a **GIF**, **PDF** or **ZIP** file. So
   * ```js
   * context.sendDocument(MediaSource.url('https://example.com/file.png'))
   * ```
   * **might** (and probably will) result in an error.
   *
   * **So, how to deal with it?** Well, you can use `forceUpload` option so `puregram`
   * fetches URL contents and uploads them directly to Bot API. This way there **should be no**
   * problems with uploading non-GIF/PDF/ZIP files
   *
   * @example
   * ```js
   * context.sendDocument(MediaSource.url(FUNNY_CAT_PNG_URL), {
   *   filename: 'funny-cat.png',
   *   forceUpload: true
   * })
   * ```
   */
  static url (url: string, options: MediaInputOptions & MediaInputUrlOptions = {}): MediaSourceUrl {
    if (typeof url !== 'string') {
      throw new TypeError(`expected 'url' to be string, found ${typeof url}`)
    }

    return {
      type: MediaSourceType.Url,
      value: url,
      ...options
    }
  }

  /**
   * Use this static method for uploading media by providing a file ID to it
   *
   * @example
   * ```js
   * context.sendPhoto(MediaSource.fileId(FUNNY_CAT_FILE_ID))
   * ```
   */
  static fileId (fileId: string, options: MediaInputOptions = {}): MediaSourceFileId {
    if (typeof fileId !== 'string') {
      throw new TypeError(`expected 'fileId' to be string, found ${typeof fileId}`)
    }

    return {
      type: MediaSourceType.FileId,
      value: fileId,
      ...options
    }
  }

  /**
   * Use this static method for uploading media by passing a buffer to it
   *
   * @example
   * ```js
   * // imagine we have some variable like this holding images
   * const group: Buffer[] = [ ... ]
   *
   * context.sendMediaGroup(
   *   group.map(
   *     element => InputMedia.photo(MediaSource.buffer(element))
   *   )
   * )
   * ```
   */
  static buffer (buffer: Buffer, options: MediaInputOptions = {}): MediaSourceBuffer {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError(`expected 'buffer' to be Buffer, found ${typeof buffer}`)
    }

    return {
      type: MediaSourceType.Buffer,
      value: buffer,
      ...options
    }
  }

  /**
   * Use this static method for uploading media by providing stream to it
   *
   * @example
   * ```js
   * context.sendDocument(MediaSource.stream(FUNNY_CAT_BUT_ITS_STREAMED))
   * ```
   */
  static stream (stream: Readable, options: MediaInputOptions = {}): MediaSourceStream {
    if (!(stream instanceof Readable)) {
      throw new TypeError(`expected 'stream' to be instance of Readable, found ${typeof stream}`)
    }

    return {
      type: MediaSourceType.Stream,
      value: stream,
      ...options
    }
  }

  /**
   * Use this static method for uploading media by passing a [File] to it
   *
   * @example
   * ```js
   * const ab = await response.arrayBuffer()
   * const file = new File([ab], filename)
   *
   * context.sendDocument(MediaSource.file(file), {
   *   filename: 'epic-stuff.epic'
   * })
   * ```
   */
  static file (file: File, options: MediaInputOptions = {}): MediaSourceFile {
    if (!(file instanceof File)) {
      throw new TypeError(`expected 'file' to be instance of File, found ${typeof file}`)
    }

    return {
      type: MediaSourceType.File,
      value: file,
      ...options
    }
  }

  /**
   * Use this static method for uploading media via [ArrayBuffer]
   *
   * @example
   * ```js
   * const ab = await response.arrayBuffer()
   *
   * context.sendPhoto(MediaSource.arrayBuffer(ab))
   * ```
   */
  static arrayBuffer (buffer: ArrayBufferLike, options: MediaInputOptions = {}): MediaSourceArrayBuffer {
    if (!(buffer instanceof ArrayBuffer) && !(buffer instanceof SharedArrayBuffer)) {
      throw new TypeError(`expected 'buffer' to be instance of ArrayBuffer/SharedArrayBuffer, found ${typeof buffer}`)
    }

    return {
      type: MediaSourceType.ArrayBuffer,
      value: buffer,
      ...options
    }
  }

  /**
   * Use this static method for uploading media via [base64].
   * It will try to convert [base64] into a [Buffer] because it is not possible to
   * upload media via [base64] in Telegram
   *
   * @example
   * ```js
   * const base64 = await getBase64() // somehow
   *
   * context.sendDocument(MediaSource.base64(base64))
   * ```
   */
  static base64 (b64: string, options: MediaInputOptions = {}) {
    if (typeof b64 !== 'string') {
      throw new TypeError(`expected 'b64' to be string, found ${typeof b64}`)
    }

    const buffer = Buffer.from(b64, 'base64')

    return MediaSource.buffer(buffer, options)
  }
}

export class MediaSourceTo {
  /**
   * Use this to specify the output file's path.
   */
  static path (path: string, options: MediaInputOptions = {}): MediaSourceToPath {
    return {
      type: MediaSourceType.Path,
      value: path,
      ...options
    }
  }

  /**
   * Use this to specify that the output must be returned as a buffer.
   */
  static buffer (options: MediaInputOptions = {}): MediaSourceToBuffer {
    return {
      type: MediaSourceType.Buffer,
      ...options
    }
  }

  /**
   * Use this to specify that the output will be written to the provided stream.
   */
  static stream (stream: Writable, options: MediaInputOptions = {}): MediaSourceToStream {
    return {
      type: MediaSourceType.Stream,
      value: stream,
      ...options
    }
  }
}
