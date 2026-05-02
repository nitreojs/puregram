import type {
  TelegramReactionTypeCustomEmoji,
  TelegramReactionTypeEmoji,
  TelegramReactionTypePaid
} from '@puregram/api'

/**
 * static factories for `ReactionType` — used by `setMessageReaction` and the
 * `tg.react(...)` shortcut
 *
 * @example
 * ```ts
 * tg.react(chat, messageId, [Reaction.emoji('👍')])
 * tg.react(chat, messageId, [Reaction.customEmoji(stickerSetId)])
 * tg.react(chat, messageId, [Reaction.paid()])
 * ```
 */
export class Reaction {
  /** standard emoji reaction */
  static emoji (emoji: TelegramReactionTypeEmoji['emoji']) {
    return { type: 'emoji', emoji } as TelegramReactionTypeEmoji
  }

  /** custom-emoji reaction (premium) */
  static customEmoji (id: string) {
    return { type: 'custom_emoji', custom_emoji_id: id } as TelegramReactionTypeCustomEmoji
  }

  /** paid star reaction */
  static paid () {
    return { type: 'paid' } as TelegramReactionTypePaid
  }
}
