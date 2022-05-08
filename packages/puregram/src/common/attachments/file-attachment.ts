import { inspectable } from 'inspectable'

import { AttachmentType } from '../../types/types'

import { Attachment } from './attachment'

export interface DefaultAttachment {
  file_id: string

  file_unique_id: string
}

/** Attachment with `fileId` and `fileUniqueId` properties */
export class FileAttachment<T extends DefaultAttachment = DefaultAttachment> extends Attachment {
  protected payload: T

  attachmentType?: AttachmentType

  constructor(payload: T) {
    super()

    this.payload = payload
  }

  /**
   * Identifier for this file, which can be used to download or reuse the file
   */
  get fileId() {
    return this.payload.file_id
  }

  /**
   * Unique identifier for this file, which is supposed to be the same over
   * time and for different bots. Can't be used to download or reuse the file.
   */
  get fileUniqueId() {
    return this.payload.file_unique_id
  }
}

inspectable(FileAttachment, {
  serialize(attachment) {
    return {
      fileId: attachment.fileId,
      fileUniqueId: attachment.fileUniqueId
    }
  }
})
