import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { AttachmentType } from '../../types/types'

import { PhotoSize } from '../structures'

import { FileAttachment } from './file-attachment'

/**
 * This object represents an audio file to be treated as music by the Telegram
 * clients.
 */
export class AudioAttachment extends FileAttachment<Interfaces.TelegramAudio> {
  attachmentType: AttachmentType = 'audio'

  /** Duration of the audio in seconds as defined by sender */
  get duration () {
    return this.payload.duration
  }

  /** Performer of the audio as defined by sender or by audio tags */
  get performer () {
    return this.payload.performer
  }

  /** Title of the audio as defined by sender or by audio tags */
  get title () {
    return this.payload.title
  }

  /** Original filename as defined by sender */
  get fileName () {
    return this.payload.file_name
  }

  /** MIME type of the file as defined by sender */
  get mimeType () {
    return this.payload.mime_type
  }

  /** File size */
  get fileSize () {
    return this.payload.file_size
  }

  /** Thumbnail of the album cover to which the music file belongs */
  get thumb () {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
  }
}

inspectable(AudioAttachment, {
  serialize (attachment) {
    return {
      fileId: attachment.fileId,
      fileUniqueId: attachment.fileUniqueId,
      duration: attachment.duration,
      performer: attachment.performer,
      title: attachment.title,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      thumb: attachment.thumb
    }
  }
})
