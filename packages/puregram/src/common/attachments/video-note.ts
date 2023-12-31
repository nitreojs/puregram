import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import type { AttachmentType } from '../../types/types'

import { PhotoSize } from '../structures/photo-size'

import { FileAttachment } from './file-attachment'

/** This object represents a video message. */
// TODO: extended: ['fileId', 'fileUniqueId']
@Inspectable()
export class VideoNoteAttachment extends FileAttachment<Interfaces.TelegramVideoNote> {
  attachmentType: AttachmentType = 'video_note'

  /**
   * Video width and height (diameter of the video message) as defined by
   * sender
   */
  @Inspect()
  get length () {
    return this.payload.length
  }

  /** Duration of the video in seconds as defined by sender */
  @Inspect()
  get duration () {
    return this.payload.duration
  }

  /** Video thumbnail */
  @Inspect({ nullable: false })
  get thumbnail () {
    const { thumbnail } = this.payload

    if (!thumbnail) {
      return
    }

    return new PhotoSize(thumbnail)
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
