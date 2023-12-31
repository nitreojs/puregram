import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import type { AttachmentType } from '../../types/types'

import { PhotoSize } from '../structures/photo-size'

import { FileAttachment } from './file-attachment'

/**
 * This object represents a general file (as opposed to photos, voice messages
 * and audio files).
 */
// TODO: extended: ['fileId', 'fileUniqueId']
@Inspectable()
export class DocumentAttachment extends FileAttachment<Interfaces.TelegramDocument> {
  attachmentType: AttachmentType = 'document'

  /** Document thumbnail as defined by sender */
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
