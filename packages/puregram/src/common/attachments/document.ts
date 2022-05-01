import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { PhotoSize } from '../structures'

import { FileAttachment } from './file-attachment'

/**
 * This object represents a general file (as opposed to photos, voice messages
 * and audio files).
 */
export class DocumentAttachment extends FileAttachment<Interfaces.TelegramDocument> {
  attachmentType: 'document' = 'document'

  /** Document thumbnail as defined by sender */
  get thumb() {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
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
}

inspectable(DocumentAttachment, {
  serialize(document: DocumentAttachment) {
    return {
      fileId: document.fileId,
      fileUniqueId: document.fileUniqueId,
      thumb: document.thumb,
      fileName: document.fileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize
    }
  }
})
