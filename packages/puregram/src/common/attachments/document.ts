import { inspectable } from 'inspectable';

import { TelegramDocument } from '../../interfaces';
import { PhotoSize } from '../structures/photo-size';
import { FileAttachment } from './file-attachment';

/**
 * This object represents a general file (as opposed to photos, voice messages
 * and audio files).
 */
export class Document extends FileAttachment<TelegramDocument> {
  public attachmentType: 'document' = 'document';

  /** Document thumbnail as defined by sender */
  public get thumb(): PhotoSize | undefined {
    const { thumb } = this.payload;

    if (!thumb) return undefined;

    return new PhotoSize(thumb);
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
}

inspectable(Document, {
  serialize(document: Document) {
    return {
      fileId: document.fileId,
      fileUniqueId: document.fileUniqueId,
      thumb: document.thumb,
      fileName: document.fileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize
    };
  }
});
