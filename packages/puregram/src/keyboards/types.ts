export type MaybeArray<T> = T | T[]

export interface ButtonStyleParams {
  style?: 'primary' | 'secondary' | 'danger' | 'success'
  iconCustomEmojiId?: string
}
