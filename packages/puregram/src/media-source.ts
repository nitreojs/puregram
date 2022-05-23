import { Readable } from 'node:stream'

interface MediaInputOptions {
  /** Sets custom file name */
  filename?: string
}

interface MediaInputUrlOptions {
  /**
   * Tells `puregram` to fetch URL contents and upload them directly to Bot API
   * instead of passing raw URL as an end value
   */
  forceUpload?: boolean
}

export interface MediaSourceBase extends MediaInputOptions {
  type: 'path' | 'url' | 'file_id' | 'buffer' | 'stream'
}

export interface MediaSourcePath extends MediaSourceBase {
  type: 'path'
  value: string
}

export interface MediaSourceUrl extends MediaSourceBase, MediaInputUrlOptions {
  type: 'url'
  value: string
}

export interface MediaSourceFileId extends MediaSourceBase {
  type: 'file_id'
  value: string
}

export interface MediaSourceBuffer extends MediaSourceBase {
  type: 'buffer'
  value: Buffer
}

export interface MediaSourceStream extends MediaSourceBase {
  type: 'stream'
  value: Readable
}

export type MediaInput =
  | MediaSourcePath
  | MediaSourceUrl
  | MediaSourceFileId
  | MediaSourceBuffer
  | MediaSourceStream

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
  static path(path: string, options: MediaInputOptions = {}): MediaSourcePath {
    return {
      type: 'path',
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
  static url(url: string, options: MediaInputOptions & MediaInputUrlOptions = {}): MediaSourceUrl {
    return {
      type: 'url',
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
  static fileId(fileId: string, options: MediaInputOptions = {}): MediaSourceFileId {
    return {
      type: 'file_id',
      value: fileId,
      ...options
    }
  }

  /**
   * Use this static method for uploading media by passing a buffer to it
   * 
   * @example
   * ```js
   * // imagine we have some variable like this
   * const group: Buffer[] = [ ... ]
   * 
   * context.sendMediaGroup(
   *   group.map(element => MediaSource.buffer(element))
   * )
   * ```
   */
  static buffer(buffer: Buffer, options: MediaInputOptions = {}): MediaSourceBuffer {
    return {
      type: 'buffer',
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
  static stream(stream: Readable, options: MediaInputOptions = {}): MediaSourceStream {
    return {
      type: 'stream',
      value: stream,
      ...options
    }
  }
}
