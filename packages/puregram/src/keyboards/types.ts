import type { TelegramInlineKeyboardButton, TelegramKeyboardButton } from '@puregram/api'

export type MaybeArray<T> = T | T[]

export type ButtonStyle = NonNullable<TelegramKeyboardButton['style']>

/** named constants for `ButtonStyle` — `ButtonStyle.Primary` and `'primary'` are interchangeable */
export const ButtonStyle = {
  Primary: 'primary',
  Danger: 'danger',
  Success: 'success'
} as const satisfies Record<string, ButtonStyle>

export interface ButtonStyleParams {
  style?: ButtonStyle
  iconCustomEmojiId?: string
}

/** `disabled` exists on `InlineKeyboardButton` only — reply-keyboard buttons have no such field */
export interface InlineButtonParams extends ButtonStyleParams {
  disabled?: boolean
}

export type CallbackData = string | number

export function normalizeCallbackData (data: CallbackData) {
  const str = typeof data === 'number' ? String(data) : data
  const bytes = new TextEncoder().encode(str).length

  if (bytes < 1 || bytes > 64) {
    throw new RangeError(`callback_data must be 1-64 bytes (got ${bytes})`)
  }

  return str
}

export function decorateInlineButton (button: TelegramInlineKeyboardButton, params: InlineButtonParams) {
  if (params.style) {
    button.style = params.style
  }

  if (params.iconCustomEmojiId) {
    button.icon_custom_emoji_id = params.iconCustomEmojiId
  }

  if (params.disabled === true) {
    button.disabled = {}
  }

  return button
}
