import type { TelegramMessageEntity } from './generated/types'

/**
 * structural shape markup libraries (e.g. `@puregram/markup`) implement.
 * text/entities request fields are widened to `string | Formattable`; the
 * runtime hook unwraps before the request leaves
 */
export interface Formattable {
  readonly text: string
  readonly entities: readonly TelegramMessageEntity[]
}
