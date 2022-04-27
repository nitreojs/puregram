import { inspectable } from 'inspectable'

import { TelegramAnimation } from '../../generated/telegram-interfaces'

import { PhotoSize } from '../structures/photo-size'

import { FileAttachment } from './file-attachment'

/**
 * This object represents an animation file
 * (GIF or H.264/MPEG-4 AVC video without sound).
 */
export class AnimationAttachment extends FileAttachment<TelegramAnimation> {
  attachmentType: 'animation' = 'animation'

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

  /** Animation thumbnail as defined by sender */
  get thumb() {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
  }

  /** Original animation filename as defined by sender */
  get fileName() {
    return this.payload.file_name
  }

  /** MIME type of the file as defined by sender */
  get mimeType() {
    return this.payload.mime_type
  }

  /** File size */
  get fileSize() {
    return this.payload.file_size
  }
}

inspectable(AnimationAttachment, {
  serialize(animation: AnimationAttachment) {
    return {
      fileId: animation.fileId,
      fileUniqueId: animation.fileUniqueId,
      width: animation.width,
      height: animation.height,
      duration: animation.duration,
      thumb: animation.thumb,
      fileName: animation.fileName,
      mimeType: animation.mimeType,
      fileSize: animation.fileSize
    }
  }
})
