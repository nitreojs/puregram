import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { PhotoSize } from '../structures'

import { FileAttachment } from './file-attachment'

/**
 * This object represents an audio file to be treated as music by the Telegram
 * clients.
 */
export class AudioAttachment extends FileAttachment<Interfaces.TelegramAudio> {
  attachmentType: 'audio' = 'audio'

  /** Duration of the audio in seconds as defined by sender */
  get duration() {
    return this.payload.duration
  }

  /** Performer of the audio as defined by sender or by audio tags */
  get performer() {
    return this.payload.performer
  }

  /** Title of the audio as defined by sender or by audio tags */
  get title() {
    return this.payload.title
  }

  /** Original filename as defined by sender */
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

  /** Thumbnail of the album cover to which the music file belongs */
  get thumb() {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
  }
}

inspectable(AudioAttachment, {
  serialize(audio: AudioAttachment) {
    return {
      fileId: audio.fileId,
      fileUniqueId: audio.fileUniqueId,
      duration: audio.duration,
      performer: audio.performer,
      title: audio.title,
      fileName: audio.fileName,
      mimeType: audio.mimeType,
      fileSize: audio.fileSize,
      thumb: audio.thumb
    }
  }
})
