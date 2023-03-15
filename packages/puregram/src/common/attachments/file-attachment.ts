import { Inspect, Inspectable } from 'inspectable'

import { AttachmentType } from '../../types/types'

import { Attachment } from './attachment'

export interface DefaultAttachment {
  file_id: string

  file_unique_id: string
}

/** Attachment with `fileId` and `fileUniqueId` properties */
@Inspectable()
export class FileAttachment<T extends DefaultAttachment = DefaultAttachment> extends Attachment {
  protected payload: T

  /** Returns attachment's type (e.g. `'audio'`, `'photo'`) */
  attachmentType?: AttachmentType

  constructor (payload: T) {
    super()

    this.payload = payload
  }

  /** Identifier for this file, which can be used to download or reuse the file */
  @Inspect()
  get fileId () {
    return this.payload.file_id
  }

  /**
   * Unique identifier for this file, which is supposed to be the same over
   * time and for different bots. Can't be used to download or reuse the file.
   */
  @Inspect()
  get fileUniqueId () {
    return this.payload.file_unique_id
  }
}
