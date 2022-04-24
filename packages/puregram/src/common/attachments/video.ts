import { inspectable } from 'inspectable'

import { TelegramVideo } from '../../telegram-interfaces'

import { PhotoSize } from '../structures/photo-size'

import { FileAttachment } from './file-attachment'

/** This object represents a video file. */
export class VideoAttachment extends FileAttachment<TelegramVideo> {
  attachmentType: 'video' = 'video'

  /** Video width as defined by sender */
  get width(): number {
    return this.payload.width
  }

  /** Video height as defined by sender */
  get height(): number {
    return this.payload.height
  }

  /** Duration of the video in seconds as defined by sender */
  get duration(): number {
    return this.payload.duration
  }

  /** Video thumbnail */
  get thumb(): PhotoSize | undefined {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
  }

  /** Original filename as defined by sender */
  get fileName(): string | undefined {
    return this.payload.file_name
  }

  /** Mime type of a file as defined by sender */
  get mimeType(): string | undefined {
    return this.payload.mime_type
  }

  /** File size */
  get fileSize(): number | undefined {
    return this.payload.file_size
  }
}

inspectable(VideoAttachment, {
  serialize(video: VideoAttachment) {
    return {
      fileId: video.fileId,
      fileUniqueId: video.fileUniqueId,
      width: video.width,
      height: video.height,
      duration: video.duration,
      thumb: video.thumb,
      fileName: video.fileName,
      mimeType: video.mimeType,
      fileSize: video.fileSize
    }
  }
})
