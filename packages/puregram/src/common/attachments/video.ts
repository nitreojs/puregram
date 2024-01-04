import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import type { AttachmentType } from '../../types/types'

import { PhotoSize } from '../structures/photo-size'

import { FileAttachment } from './file-attachment'
import { memoizeGetters } from '../../utils/helpers'

/** This object represents a video file. */
// TODO: extended: ['fileId', 'fileUniqueId']
@Inspectable()
export class VideoAttachment extends FileAttachment<Interfaces.TelegramVideo> {
  attachmentType: AttachmentType = 'video'

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

  /** Video thumbnail */
  @Inspect({ nullable: false })
  get thumbnail () {
    const { thumbnail } = this.payload

    if (!thumbnail) {
      return
    }

    return new PhotoSize(thumbnail)
  }

  /** Original filename as defined by sender */
  @Inspect({ nullable: false })
  get fileName () {
    return this.payload.file_name
  }

  /** Mime type of a file as defined by sender */
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

memoizeGetters(VideoAttachment, ['thumbnail'])
