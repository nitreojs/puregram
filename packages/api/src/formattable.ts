import type { TelegramMessageEntity } from './generated/types'

/**
 * structural shape that markup-producing libraries (e.g. @puregram/markup) implement.
 * paired text/entities request fields are widened to `string | Formattable` in
 * generated method params; the runtime hook unwraps these before the request leaves
 */
export interface Formattable {
  readonly text: string
  readonly entities: readonly TelegramMessageEntity[]
}
