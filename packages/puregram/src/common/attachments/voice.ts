import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { FileAttachment } from './file-attachment'

/** This object represents a voice note. */
export class VoiceAttachment extends FileAttachment<Interfaces.TelegramVoice> {
  attachmentType: 'voice' = 'voice'

  /** Duration of the audio in seconds as defined by sender */
  get duration() {
    return this.payload.duration
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

inspectable(VoiceAttachment, {
  serialize(voice: VoiceAttachment) {
    return {
      fileId: voice.fileId,
      fileUniqueId: voice.fileUniqueId,
      duration: voice.duration,
      mimeType: voice.mimeType,
      fileSize: voice.fileSize
    }
  }
})
