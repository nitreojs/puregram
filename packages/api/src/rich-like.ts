import type { TelegramInputRichMessage } from './generated/types'

/**
 * structural shape rich-message builders (e.g. `@puregram/rich`) implement.
 * `rich_message` request fields are widened to `TelegramInputRichMessage | RichLike`;
 * the value's `toJSON` / `toInputRichMessage` unwraps before the request leaves
 */
export interface RichLike {
  toInputRichMessage: () => TelegramInputRichMessage
}
