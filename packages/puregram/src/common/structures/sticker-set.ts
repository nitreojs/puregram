import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

import { StickerAttachment } from '../attachments'

import { PhotoSize } from './photo-size'

export class StickerSet implements Structure {
  constructor (private payload: Interfaces.TelegramStickerSet) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Sticker set name */
  get name () {
    return this.payload.name
  }

  /** Sticker set title */
  get title () {
    return this.payload.title
  }

  /** Type of stickers in the set, currently one of `regular`, `mask`, `custom_emoji` */
  get stickerType () {
    return this.payload.sticker_type
  }

  /** `true`, if the sticker set contains animated stickers */
  isAnimated () {
    return this.payload.is_animated
  }

  /** `true`, if the sticker set contains video stickers */
  isVideo () {
    return this.payload.is_video
  }

  /** `true`, if the sticker set contains masks */
  get containsMasks () {
    return this.payload.contains_masks
  }

  /** List of all set stickers */
  get stickers () {
    const { stickers } = this.payload

    if (!stickers.length) {
      return
    }

    return stickers.map(sticker => new StickerAttachment(sticker))
  }

  /** Sticker set thumbnail in the .WEBP or .TGS format */
  get thumbnail () {
    const { thumbnail } = this.payload

    if (!thumbnail) {
      return
    }

    return new PhotoSize(thumbnail)
  }

  toJSON (): Interfaces.TelegramStickerSet {
    return {
      name: this.name,
      title: this.title,
      sticker_type: this.stickerType,
      is_animated: this.isAnimated(),
      is_video: this.isVideo(),
      contains_masks: this.containsMasks,
      stickers: this.stickers?.map(sticker => sticker.toJSON()) ?? [],
      thumbnail: this.thumbnail?.toJSON()
    }
  }
}

inspectable(StickerSet, {
  serialize (struct) {
    const payload = {
      name: struct.name,
      title: struct.title,
      stickerType: struct.stickerType,
      isAnimated: struct.isAnimated(),
      isVideo: struct.isVideo(),
      containsMasks: struct.containsMasks,
      stickers: struct.stickers,
      thumbnail: struct.thumbnail
    }

    return filterPayload(payload)
  }
})
