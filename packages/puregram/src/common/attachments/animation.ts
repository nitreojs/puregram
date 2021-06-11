import { inspectable } from 'inspectable';

import { FileAttachment } from './file-attachment';

import { TelegramAnimation } from '../../telegram-interfaces';
import { PhotoSize } from '../structures/photo-size';

/**
 * This object represents an animation file
 * (GIF or H.264/MPEG-4 AVC video without sound).
 */
export class AnimationAttachment extends FileAttachment<TelegramAnimation> {
  public attachmentType: 'animation' = 'animation';

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

  /** Animation thumbnail as defined by sender */
  public get thumb(): PhotoSize | undefined {
    const { thumb } = this.payload;

    if (!thumb) return undefined;

    return new PhotoSize(thumb);
  }

  /** Original animation filename as defined by sender */
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

inspectable(AnimationAttachment, {
  serialize(animation: AnimationAttachment) {
    return {
      fileId: animation.fileId,
      fileUniqueId: animation.fileUniqueId,
      width: animation.width,
      height: animation.height,
      duration: animation.duration,
      thumb: animation.thumb,
      fileName: animation.fileName,
      mimeType: animation.mimeType,
      fileSize: animation.fileSize
    };
  }
});
