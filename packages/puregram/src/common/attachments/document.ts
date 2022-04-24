import { inspectable } from 'inspectable'

import { TelegramDocument } from '../../telegram-interfaces'

import { PhotoSize } from '../structures/photo-size'

import { FileAttachment } from './file-attachment'

/**
 * This object represents a general file (as opposed to photos, voice messages
 * and audio files).
 */
export class DocumentAttachment extends FileAttachment<TelegramDocument> {
  attachmentType: 'document' = 'document'

  /** Document thumbnail as defined by sender */
  get thumb(): PhotoSize | undefined {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
  }

  /** Original filename as defined by sender */
  get fileName(): string | undefined {
    return this.payload.file_name
  }

  /** MIME type of the file as defined by sender */
  get mimeType(): string | undefined {
    return this.payload.mime_type
  }

  /** File size */
  get fileSize(): number | undefined {
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
