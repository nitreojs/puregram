import { inspectable } from 'inspectable';

import { TelegramPhotoSize } from '../../interfaces';
import { filterPayload } from '../../utils/helpers';

/** This object represents one size of a photo or a file / sticker thumbnail */
export class PhotoSize {
  private payload: TelegramPhotoSize;

  constructor(payload: TelegramPhotoSize) {
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

  /** Photo width */
  public get width(): number {
    return this.payload.width;
  }

  /** Photo height */
  public get height(): number {
    return this.payload.height;
  }

  /** File size */
  public get fileSize(): number | undefined {
    return this.payload.file_size;
  }
}

inspectable(PhotoSize, {
  serialize(size: PhotoSize) {
    const payload = {
      fileId: size.fileId,
      fileUniqueId: size.fileUniqueId,
      width: size.width,
      height: size.height,
      fileSize: size.fileSize
    };

    return filterPayload(payload);
  }
});
