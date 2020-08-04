import { inspectable } from 'inspectable';

import { TelegramVideo } from '../../interfaces';
import { PhotoSize } from '../structures/photo-size';
import { FileAttachment } from './file-attachment';

/** This object represents a video file. */
export class Video extends FileAttachment<TelegramVideo> {
  public attachmentType: 'video' = 'video';

  /** Video width as defined by sender */
  public get width(): number {
    return this.payload.width;
  }

  /** Video height as defined by sender */
  public get height(): number {
    return this.payload.height;
  }

  /** Duration of the video in seconds as defined by sender */
  public get duration(): number {
    return this.payload.duration;
  }

  /** Video thumbnail */
  public get thumb(): PhotoSize | undefined {
    const { thumb } = this.payload;

    if (!thumb) return undefined;

    return new PhotoSize(thumb);
  }

  /** Mime type of a file as defined by sender */
  public get mimeType(): string | undefined {
    return this.payload.mime_type;
  }

  /** File size */
  public get fileSize(): number | undefined {
    return this.payload.file_size;
  }
}

inspectable(Video, {
  serialize(video: Video) {
    return {
      fileId: video.fileId,
      fileUniqueId: video.fileUniqueId,
      width: video.width,
      height: video.height,
      duration: video.duration,
      thumb: video.thumb,
      mimeType: video.mimeType,
      fileSize: video.fileSize
    };
  }
});
