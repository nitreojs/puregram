import { inspectable } from 'inspectable'

import { StickerAttachment } from '../attachments'

import { TelegramStickerSet, TelegramSticker } from '../../telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { PhotoSize } from './photo-size'

export class StickerSet {
  constructor(private payload: TelegramStickerSet) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Sticker set name */
  get name(): string {
    return this.payload.name
  }

  /** Sticker set title */
  get title(): string {
    return this.payload.title
  }

  /** `true`, if the sticker set contains animated stickers */
  get isAnimated(): boolean {
    return this.payload.is_animated
  }

  /** `true`, if the sticker set contains video stickers */
  get isVideo(): boolean {
    return this.payload.is_video
  }

  /** `true`, if the sticker set contains masks */
  get containsMasks(): boolean {
    return this.payload.contains_masks
  }

  /** List of all set stickers */
  get stickers(): StickerAttachment[] {
    const { stickers } = this.payload

    if (!stickers.length) {
      return []
    }

    return stickers.map(
      (sticker: TelegramSticker) => new StickerAttachment(sticker)
    )
  }

  /** Sticker set thumbnail in the .WEBP or .TGS format */
  get thumb(): PhotoSize | undefined {
    const { thumb } = this.payload

    if (!thumb) {
      return
    }

    return new PhotoSize(thumb)
  }
}

inspectable(StickerSet, {
  serialize(set: StickerSet) {
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
