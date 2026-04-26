import type { TelegramInlineKeyboardButton, TelegramKeyboardButton } from '@puregram/api'

export type MaybeArray<T> = T | T[]

export type ButtonStyle = 'primary' | 'danger' | 'success'

export interface ButtonStyleParams {
  style?: ButtonStyle
  iconCustomEmojiId?: string
}

/** keyboard button + puregram-internal UX fields (style, icon_custom_emoji_id) */
export interface PuregramKeyboardButton extends TelegramKeyboardButton {
  style?: ButtonStyle
  icon_custom_emoji_id?: string
}

/** inline keyboard button + puregram-internal UX fields */
export interface PuregramInlineKeyboardButton extends TelegramInlineKeyboardButton {
  style?: ButtonStyle
  icon_custom_emoji_id?: string
}
