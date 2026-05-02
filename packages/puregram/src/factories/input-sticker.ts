import type { TelegramInputSticker } from '@puregram/api'

type StickerExtras = Omit<TelegramInputSticker, 'sticker' | 'format' | 'emoji_list'>

/**
 * static factories for `InputSticker` — used by `createNewStickerSet` and
 * `addStickerToSet`. one factory per sticker file format
 *
 * @example
 * ```ts
 * tg.api.addStickerToSet({
 *   user_id, name: 'foo',
 *   sticker: InputSticker.static('attach://cat.webp', ['🐱'], { keywords: ['cat'] })
 * })
 * ```
 */
export class InputSticker {
  /** static .WEBP or .PNG image */
  static static (
    sticker: TelegramInputSticker['sticker'],
    emojiList: TelegramInputSticker['emoji_list'],
    params: StickerExtras = {}
  ): TelegramInputSticker {
    return { sticker, format: 'static', emoji_list: emojiList, ...params }
  }

  /** .TGS animated sticker */
  static animated (
    sticker: TelegramInputSticker['sticker'],
    emojiList: TelegramInputSticker['emoji_list'],
    params: StickerExtras = {}
  ): TelegramInputSticker {
    return { sticker, format: 'animated', emoji_list: emojiList, ...params }
  }

  /** .WEBM video sticker */
  static video (
    sticker: TelegramInputSticker['sticker'],
    emojiList: TelegramInputSticker['emoji_list'],
    params: StickerExtras = {}
  ): TelegramInputSticker {
    return { sticker, format: 'video', emoji_list: emojiList, ...params }
  }
}
