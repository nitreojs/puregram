import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { StickerAttachment } from '../attachments'

import { PhotoSize } from './photo-size'

export class StickerSet {
  constructor(private payload: Interfaces.TelegramStickerSet) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Sticker set name */
  get name() {
    return this.payload.name
  }

  /** Sticker set title */
  get title() {
    return this.payload.title
  }

  /** `true`, if the sticker set contains animated stickers */
  get isAnimated() {
    return this.payload.is_animated
  }

  /** `true`, if the sticker set contains video stickers */
  get isVideo() {
    return this.payload.is_video
  }

  /** `true`, if the sticker set contains masks */
  get containsMasks() {
    return this.payload.contains_masks
  }

  /** List of all set stickers */
  get stickers() {
    const { stickers } = this.payload

    if (!stickers.length) {
      return []
    }

    return stickers.map(
      (sticker: Interfaces.TelegramSticker) => new StickerAttachment(sticker)
    )
  }

  /** Sticker set thumbnail in the .WEBP or .TGS format */
  get thumb() {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
  }
}

inspectable(StickerSet, {
  serialize(set) {
    const payload = {
      name: set.name,
      title: set.title,
      isAnimated: set.isAnimated,
      containsMasks: set.containsMasks,
      stickers: set.stickers,
      thumb: set.thumb
    }

    return filterPayload(payload)
  }
})
