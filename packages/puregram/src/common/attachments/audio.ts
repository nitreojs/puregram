import { Inspectable, Inspect } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { AttachmentType } from '../../types/types'

import { PhotoSize } from '../structures'

import { FileAttachment } from './file-attachment'

/**
 * This object represents an audio file to be treated as music by the Telegram
 * clients.
 */
// TODO: extended: ['fileId', 'fileUniqueId']
@Inspectable()
export class AudioAttachment extends FileAttachment<Interfaces.TelegramAudio> {
  attachmentType: AttachmentType = 'audio'

  /** Duration of the audio in seconds as defined by sender */
  @Inspect()
  get duration () {
    return this.payload.duration
  }

  /** Performer of the audio as defined by sender or by audio tags */
  @Inspect({ nullable: false })
  get performer () {
    return this.payload.performer
  }

  /** Title of the audio as defined by sender or by audio tags */
  @Inspect({ nullable: false })
  get title () {
    return this.payload.title
  }

  /** Original filename as defined by sender */
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

  /** Thumbnail of the album cover to which the music file belongs */
  @Inspect({ nullable: false })
  get thumbnail () {
    const { thumbnail } = this.payload

    if (!thumbnail) {
      return
    }

    return new PhotoSize(thumbnail)
  }

  toJSON () {
    return this.payload
  }
}
