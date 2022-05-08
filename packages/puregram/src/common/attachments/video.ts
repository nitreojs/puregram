import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { PhotoSize } from '../structures'

import { FileAttachment } from './file-attachment'

/** This object represents a video file. */
export class VideoAttachment extends FileAttachment<Interfaces.TelegramVideo> {
  attachmentType: 'video' = 'video'

  /** Video width as defined by sender */
  get width() {
    return this.payload.width
  }

  /** Video height as defined by sender */
  get height() {
    return this.payload.height
  }

  /** Duration of the video in seconds as defined by sender */
  get duration() {
    return this.payload.duration
  }

  /** Video thumbnail */
  get thumb() {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
  }

  /** Original filename as defined by sender */
  get fileName() {
    return this.payload.file_name
  }

  /** Mime type of a file as defined by sender */
  get mimeType() {
    return this.payload.mime_type
  }

  /** File size */
  get fileSize() {
    return this.payload.file_size
  }
}

inspectable(VideoAttachment, {
  serialize(video) {
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
