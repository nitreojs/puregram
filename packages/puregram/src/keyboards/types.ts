import type { TelegramKeyboardButton } from '@puregram/api'

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

export type CallbackData = string | number

export function normalizeCallbackData (data: CallbackData) {
  const str = typeof data === 'number' ? String(data) : data
  const bytes = new TextEncoder().encode(str).length

  if (bytes < 1 || bytes > 64) {
    throw new RangeError(`callback_data must be 1-64 bytes (got ${bytes})`)
  }

  return str
}
