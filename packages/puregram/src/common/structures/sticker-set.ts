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
  get thumb () {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
  }

  toJSON (): Interfaces.TelegramStickerSet {
    return {
      name: this.name,
      title: this.title,
      is_animated: this.isAnimated(),
      is_video: this.isVideo(),
      contains_masks: this.containsMasks,
      stickers: this.stickers?.map(sticker => sticker.toJSON()) ?? [],
      thumb: this.thumb?.toJSON()
    }
  }
}

inspectable(StickerSet, {
  serialize (struct) {
    const payload = {
      name: struct.name,
      title: struct.title,
      isAnimated: struct.isAnimated(),
      isVideo: struct.isVideo(),
      containsMasks: struct.containsMasks,
      stickers: struct.stickers,
      thumb: struct.thumb
    }

    return filterPayload(payload)
  }
})
