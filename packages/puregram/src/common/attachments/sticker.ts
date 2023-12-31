import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import type { AttachmentType, Require } from '../../types/types'

import { PhotoSize } from '../structures/photo-size'
import { MaskPosition } from '../structures/mask-position'
import { File } from '../structures/file'

import { FileAttachment } from './file-attachment'

/** This object represents a sticker. */
// TODO: extended: ['fileId', 'fileUniqueId']
@Inspectable()
export class StickerAttachment extends FileAttachment<Interfaces.TelegramSticker> {
  attachmentType: AttachmentType = 'sticker'

  /**
   * Type of the sticker, currently one of `regular`, `mask`, `custom_emoji`.
   *
   * The type of the sticker is independent from its format, which is determined by the fields `is_animated` and `is_video`.
   */
  @Inspect()
  get type () {
    return this.payload.type
  }

  /** Sticker width */
  @Inspect()
  get width () {
    return this.payload.width
  }

  /** Sticker height */
  @Inspect()
  get height () {
    return this.payload.height
  }

  /** `true`, if the sticker is animated */
  @Inspect({ compute: true })
  isAnimated () {
    return this.payload.is_animated
  }

  /** `true`, if the sticker is a video sticker */
  @Inspect({ compute: true })
  isVideo () {
    return this.payload.is_video
  }

  /** Sticker thumbnail in the .WEBP or .JPG format */
  @Inspect({ nullable: false })
  get thumbnail () {
    const { thumbnail } = this.payload

    if (!thumbnail) {
      return
    }

    return new PhotoSize(thumbnail)
  }

  /** Emoji associated with the sticker */
  @Inspect({ nullable: false })
  get emoji () {
    return this.payload.emoji
  }

  /** Name of the sticker set to which the sticker belongs */
  @Inspect({ nullable: false })
  get setName () {
    return this.payload.set_name
  }

  /** Is this sticker a premium one? */
  isPremium (): this is Require<this, 'premiumAnimation'> {
    return this.premiumAnimation !== undefined
  }

  /** Premium animation for the sticker, if the sticker is premium */
  @Inspect({ nullable: false })
  get premiumAnimation () {
    const { premium_animation } = this.payload

    if (!premium_animation) {
      return
    }

    return new File(premium_animation)
  }

  /** For mask stickers, the position where the mask should be placed */
  @Inspect({ nullable: false })
  get maskPosition () {
    const { mask_position } = this.payload

    if (!mask_position) {
      return
    }

    return new MaskPosition(mask_position)
  }

  /** For custom emoji stickers, unique identifier of the custom emoji */
  @Inspect({ nullable: false })
  get customEmojiId () {
    return this.payload.custom_emoji_id
  }

  /** `true`, if the sticker must be repainted to a text color in messages, the color of the Telegram Premium badge in emoji status, white color on chat photos, or another appropriate color in other places */
  @Inspect({ nullable: false })
  get needs_repainting () {
    return this.payload.needs_repainting as true | undefined
  }

  /** File size */
  @Inspect({ nullable: false })
  get fileSize () {
    return this.payload.file_size
  }

  toJSON () {
    return this.payload
  }
}
