import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { PhotoSize } from '../structures'

import { FileAttachment } from './file-attachment'

/** This object represents a video message. */
export class VideoNoteAttachment extends FileAttachment<Interfaces.TelegramVideoNote> {
  attachmentType: 'video_note' = 'video_note'

  /**
   * Video width and height (diameter of the video message) as defined by
   * sender
   */
  get length() {
    return this.payload.length
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

  /** File size */
  get fileSize() {
    return this.payload.file_size
  }
}

inspectable(VideoNoteAttachment, {
  serialize(videoNote: VideoNoteAttachment) {
    return {
      fileId: videoNote.fileId,
      fileUniqueId: videoNote.fileUniqueId,
      length: videoNote.length,
      duration: videoNote.duration,
      thumb: videoNote.thumb,
      fileSize: videoNote.fileSize
    }
  }
})
