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
  static emoji (emoji: TelegramReactionTypeEmoji['emoji']): TelegramReactionTypeEmoji {
    return { type: 'emoji', emoji }
  }

  /** custom-emoji reaction (premium) */
  static customEmoji (id: string): TelegramReactionTypeCustomEmoji {
    return { type: 'custom_emoji', custom_emoji_id: id }
  }

  /** paid star reaction */
  static paid (): TelegramReactionTypePaid {
    return { type: 'paid' }
  }
}
