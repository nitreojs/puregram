import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { AttachmentType } from '../../types/types'

import { FileAttachment } from './file-attachment'

/** This object represents a voice note. */
export class VoiceAttachment extends FileAttachment<Interfaces.TelegramVoice> {
  attachmentType: AttachmentType = 'voice'

  /** Duration of the audio in seconds as defined by sender */
  get duration () {
    return this.payload.duration
  }

  /** MIME type of the file as defined by sender */
  get mimeType () {
    return this.payload.mime_type
  }

  /** File size */
  get fileSize () {
    return this.payload.file_size
  }

  toJSON (): Interfaces.TelegramVoice {
    return {
      file_id: this.fileId,
      file_unique_id: this.fileUniqueId,
      duration: this.duration,
      mime_type: this.mimeType,
      file_size: this.fileSize
    }
  }
}

inspectable(VoiceAttachment, {
  serialize (attachment) {
    return {
      fileId: attachment.fileId,
      fileUniqueId: attachment.fileUniqueId,
      duration: attachment.duration,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize
    }
  }
})
