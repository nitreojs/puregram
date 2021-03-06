import { inspectable } from 'inspectable';

import { TelegramFile } from '../../telegram-interfaces';
import { filterPayload } from '../../utils/helpers';

export class File {
  private payload: TelegramFile;

  constructor(payload: TelegramFile) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /**
   * Identifier for this file, which can be used to download or reuse the file
   */
  public get fileId(): string {
    return this.payload.file_id;
  }

  /**
   * Unique identifier for this file, which is supposed to be the same over
   * time and for different bots. Can't be used to download or reuse the file.
   */
  public get fileUniqueId(): string {
    return this.payload.file_unique_id;
  }

  /** File size, if known */
  public get fileSize(): number | undefined {
    return this.payload.file_size;
  }

  /**
   * File path.
   * Use `https://api.telegram.org/file/bot<token>/<file_path>` to get the
   * file.
   */
  public get filePath(): string | undefined {
    return this.payload.file_path;
  }
}

inspectable(File, {
  serialize(file: File) {
    const payload = {
      fileId: file.fileId,
      fileUniqueId: file.fileUniqueId,
      fileSize: file.fileSize,
      filePath: file.filePath
    };

    return filterPayload(payload);
  }
});
