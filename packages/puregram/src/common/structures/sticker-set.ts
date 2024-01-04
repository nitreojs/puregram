import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { StickerAttachment } from '../attachments'

import { PhotoSize } from './photo-size'
import { memoizeGetters } from '../../utils/helpers'

/** This object represents a sticker set. */
@Inspectable()
export class StickerSet implements Structure {
  constructor (public payload: Interfaces.TelegramStickerSet) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Sticker set name */
  @Inspect()
  get name () {
    return this.payload.name
  }

  /** Sticker set title */
  @Inspect()
  get title () {
    return this.payload.title
  }

  /** Type of stickers in the set, currently one of `regular`, `mask`, `custom_emoji` */
  @Inspect()
  get stickerType () {
    return this.payload.sticker_type
  }

  /** `true`, if the sticker set contains animated stickers */
  @Inspect({ compute: true })
  isAnimated () {
    return this.payload.is_animated
  }

  /** `true`, if the sticker set contains video stickers */
  @Inspect({ compute: true })
  isVideo () {
    return this.payload.is_video
  }

  /** List of all set stickers */
  @Inspect({ nullable: false })
  get stickers () {
    const { stickers } = this.payload

    if (!stickers.length) {
      return
    }

    return stickers.map(sticker => new StickerAttachment(sticker))
  }

  /** Sticker set thumbnail in the .WEBP or .TGS format */
  @Inspect({ nullable: false })
  get thumbnail () {
    const { thumbnail } = this.payload

    if (!thumbnail) {
      return
    }

    return new PhotoSize(thumbnail)
  }

  toJSON () {
    return this.payload
  }
}

memoizeGetters(StickerSet, ['thumbnail'])
