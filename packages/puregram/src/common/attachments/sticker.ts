import { inspectable } from 'inspectable'

import { TelegramSticker } from '../../generated/telegram-interfaces'

import { PhotoSize, MaskPosition } from '../structures'

import { FileAttachment } from './file-attachment'

/** This object represents a sticker. */
export class StickerAttachment extends FileAttachment<TelegramSticker> {
  attachmentType: 'sticker' = 'sticker'

  /** Sticker width */
  get width() {
    return this.payload.width
  }

  /** Sticker height */
  get height() {
    return this.payload.height
  }

  /** `true`, if the sticker is animated */
  get isAnimated() {
    return this.payload.is_animated
  }

  /** `true`, if the sticker is a video sticker */
  get isVideo() {
    return this.payload.is_video
  }

  /** Sticker thumbnail in the .WEBP or .JPG format */
  get thumb() {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
  }

  /** Emoji associated with the sticker */
  get emoji() {
    return this.payload.emoji
  }

  /** Name of the sticker set to which the sticker belongs */
  get setName() {
    return this.payload.set_name
  }

  /** For mask stickers, the position where the mask should be placed */
  get maskPosition() {
    const { mask_position } = this.payload

    if (!mask_position) {
      return
    }

    return new MaskPosition(mask_position)
  }

  /** File size */
  get fileSize() {
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
