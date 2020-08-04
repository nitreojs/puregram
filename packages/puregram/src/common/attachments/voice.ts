import { inspectable } from 'inspectable';

import { TelegramVoice } from '../../interfaces';
import { FileAttachment } from './file-attachment';

/** This object represents a voice note. */
export class Voice extends FileAttachment<TelegramVoice> {
  public attachmentType: 'voice' = 'voice';

  /** Duration of the audio in seconds as defined by sender */
  public get duration(): number {
    return this.payload.duration;
  }

  /** MIME type of the file as defined by sender */
  public get mimeType(): string | undefined {
    return this.payload.mime_type;
  }

  /** File size */
  public get fileSize(): number | undefined {
    return this.payload.file_size;
  }
}

inspectable(Voice, {
  serialize(voice: Voice) {
    return {
      fileId: voice.fileId,
      fileUniqueId: voice.fileUniqueId,
      duration: voice.duration,
      mimeType: voice.mimeType,
      fileSize: voice.fileSize
    };
  }
});
