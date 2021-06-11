import { inspectable } from 'inspectable';

import { FileAttachment } from './file-attachment';

import { TelegramAudio } from '../../telegram-interfaces';
import { PhotoSize } from '../structures/photo-size';

/**
 * This object represents an audio file to be treated as music by the Telegram
 * clients.
 */
export class AudioAttachment extends FileAttachment<TelegramAudio> {
  public attachmentType: 'audio' = 'audio';

  /** Duration of the audio in seconds as defined by sender */
  public get duration(): number {
    return this.payload.duration;
  }

  /** Performer of the audio as defined by sender or by audio tags */
  public get performer(): string | undefined {
    return this.payload.performer;
  }

  /** Title of the audio as defined by sender or by audio tags */
  public get title(): string | undefined {
    return this.payload.title;
  }

  /** Original filename as defined by sender */
  public get fileName(): string | undefined {
    return this.payload.file_name;
  }

  /** MIME type of the file as defined by sender */
  public get mimeType(): string | undefined {
    return this.payload.mime_type;
  }

  /** File size */
  public get fileSize(): number | undefined {
    return this.payload.file_size;
  }

  /** Thumbnail of the album cover to which the music file belongs */
  public get thumb(): PhotoSize | undefined {
    const { thumb } = this.payload;

    if (!thumb) return undefined;

    return new PhotoSize(thumb);
  }
}

inspectable(AudioAttachment, {
  serialize(audio: AudioAttachment) {
    return {
      fileId: audio.fileId,
      fileUniqueId: audio.fileUniqueId,
      duration: audio.duration,
      performer: audio.performer,
      title: audio.title,
      fileName: audio.fileName,
      mimeType: audio.mimeType,
      fileSize: audio.fileSize,
      thumb: audio.thumb
    };
  }
});
