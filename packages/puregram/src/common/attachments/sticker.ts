import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { PhotoSize, MaskPosition, File } from '../structures'

import { FileAttachment } from './file-attachment'

/** This object represents a sticker. */
export class StickerAttachment extends FileAttachment<Interfaces.TelegramSticker> {
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

  /** Premium animation for the sticker, if the sticker is premium */
  get premiumAnimation() {
    const { premium_animation } = this.payload

    if (!premium_animation) {
      return
    }

    return new File(premium_animation)
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
  serialize(attachment) {
    return {
      fileId: attachment.fileId,
      fileUniqueId: attachment.fileUniqueId,
      width: attachment.width,
      height: attachment.height,
      isAnimated: attachment.isAnimated,
      thumb: attachment.thumb,
      emoji: attachment.emoji,
      setName: attachment.setName,
      maskPosition: attachment.maskPosition,
      fileSize: attachment.fileSize
    }
  }
})
