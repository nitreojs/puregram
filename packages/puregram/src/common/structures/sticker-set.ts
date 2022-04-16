import { inspectable } from 'inspectable'

import { StickerAttachment } from '../attachments'

import { TelegramStickerSet, TelegramSticker } from '../../telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { PhotoSize } from './photo-size'

export class StickerSet {
  constructor(private payload: TelegramStickerSet) { }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Sticker set name */
  public get name(): string {
    return this.payload.name
  }

  /** Sticker set title */
  public get title(): string {
    return this.payload.title
  }

  /** `true`, if the sticker set contains animated stickers */
  public get isAnimated(): boolean {
    return this.payload.is_animated
  }

  /** `true`, if the sticker set contains video stickers */
  public get isVideo(): boolean {
    return this.payload.is_video
  }

  /** `true`, if the sticker set contains masks */
  public get containsMasks(): boolean {
    return this.payload.contains_masks
  }

  /** List of all set stickers */
  public get stickers(): StickerAttachment[] {
    const { stickers } = this.payload

    if (!stickers.length) return []

    return stickers.map(
      (sticker: TelegramSticker) => new StickerAttachment(sticker)
    )
  }

  /** Sticker set thumbnail in the .WEBP or .TGS format */
  public get thumb(): PhotoSize | undefined {
    const { thumb } = this.payload

    if (!thumb) return undefined

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
