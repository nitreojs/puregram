import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { AttachmentType } from '../../types/types'

import { PhotoSize } from '../structures'

import { FileAttachment } from './file-attachment'

/**
 * This object represents a general file (as opposed to photos, voice messages
 * and audio files).
 */
export class DocumentAttachment extends FileAttachment<Interfaces.TelegramDocument> {
  attachmentType: AttachmentType = 'document'

  /** Document thumbnail as defined by sender */
  get thumb () {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
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
}

inspectable(DocumentAttachment, {
  serialize (attachment) {
    return {
      fileId: attachment.fileId,
      fileUniqueId: attachment.fileUniqueId,
      thumb: attachment.thumb,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize
    }
  }
})
