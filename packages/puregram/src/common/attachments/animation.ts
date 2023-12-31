import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import type { AttachmentType } from '../../types/types'

import { PhotoSize } from '../structures/photo-size'

import { FileAttachment } from './file-attachment'

/**
 * This object represents an animation file
 * (GIF or H.264/MPEG-4 AVC video without sound).
 */
// TODO: extended: ['fileId', 'fileUniqueId']
@Inspectable()
export class AnimationAttachment extends FileAttachment<Interfaces.TelegramAnimation> {
  attachmentType: AttachmentType = 'animation'

  /** Video width as defined by sender */
  @Inspect()
  get width () {
    return this.payload.width
  }

  /** Video height as defined by sender */
  @Inspect()
  get height () {
    return this.payload.height
  }

  /** Duration of the video in seconds as defined by sender */
  @Inspect()
  get duration () {
    return this.payload.duration
  }

  /** Animation thumbnail as defined by sender */
  @Inspect({ nullable: false })
  get thumbnail () {
    const { thumbnail } = this.payload

    if (!thumbnail) {
      return
    }

    return new PhotoSize(thumbnail)
  }

  /** Original animation filename as defined by sender */
  @Inspect({ nullable: false })
  get fileName () {
    return this.payload.file_name
  }

  /** MIME type of the file as defined by sender */
  @Inspect({ nullable: false })
  get mimeType () {
    return this.payload.mime_type
  }

  /** File size */
  @Inspect({ nullable: false })
  get fileSize () {
    return this.payload.file_size
  }

  toJSON () {
    return this.payload
  }
}
