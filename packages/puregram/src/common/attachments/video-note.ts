import { inspectable } from 'inspectable'

import { FileAttachment } from './file-attachment'

import { TelegramVideoNote } from '../../telegram-interfaces'
import { PhotoSize } from '../structures/photo-size'

/** This object represents a video message. */
export class VideoNoteAttachment extends FileAttachment<TelegramVideoNote> {
  attachmentType: 'video_note' = 'video_note'

  /**
   * Video width and height (diameter of the video message) as defined by
   * sender
   */
  get length(): number {
    return this.payload.length
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

  /** File size */
  get fileSize(): number | undefined {
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
