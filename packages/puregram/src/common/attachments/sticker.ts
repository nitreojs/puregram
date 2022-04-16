import { inspectable } from 'inspectable'

import { FileAttachment } from './file-attachment'

import { PhotoSize } from '../structures/photo-size'

import { TelegramSticker } from '../../telegram-interfaces'
import { MaskPosition } from '../structures/mask-position'

/** This object represents a sticker. */
export class StickerAttachment extends FileAttachment<TelegramSticker> {
  public attachmentType: 'sticker' = 'sticker';

  /** Sticker width */
  public get width(): number {
    return this.payload.width
  }

  /** Sticker height */
  public get height(): number {
    return this.payload.height
  }

  /** `true`, if the sticker is animated */
  public get isAnimated(): boolean {
    return this.payload.is_animated
  }

  /** `true`, if the sticker is a video sticker */
  public get isVideo(): boolean {
    return this.payload.is_video
  }

  /** Sticker thumbnail in the .WEBP or .JPG format */
  public get thumb(): PhotoSize | undefined {
    const { thumb } = this.payload

    if (!thumb) return undefined

    return new PhotoSize(thumb)
  }

  /** Emoji associated with the sticker */
  public get emoji(): string | undefined {
    return this.payload.emoji
  }

  /** Name of the sticker set to which the sticker belongs */
  public get setName(): string | undefined {
    return this.payload.set_name
  }

  /** For mask stickers, the position where the mask should be placed */
  public get maskPosition(): MaskPosition | undefined {
    const { mask_position } = this.payload

    if (!mask_position) return undefined

    return new MaskPosition(mask_position)
  }

  /** File size */
  public get fileSize(): number | undefined {
    return this.payload.file_size
  }
}

inspectable(StickerAttachment, {
  serialize(sticker: StickerAttachment) {
    return {
      fileId: sticker.fileId,
      fileUniqueId: sticker.fileUniqueId,
      width: sticker.width,
      height: sticker.height,
      isAnimated: sticker.isAnimated,
      thumb: sticker.thumb,
      emoji: sticker.emoji,
      setName: sticker.setName,
      maskPosition: sticker.maskPosition,
      fileSize: sticker.fileSize
    }
  }
})
