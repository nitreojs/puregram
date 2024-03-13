import * as Interfaces from '../generated/telegram-interfaces'

/** Class for easier reaction interaction with API */
export class Reaction {
  /** Creates an emoji reaction object */
  static emoji (emoji: Interfaces.TelegramReactionTypeEmoji['emoji']): Interfaces.TelegramReactionTypeEmoji {
    return {
      type: 'emoji',
      emoji
    }
  }

  /** Creates a custom emoji reaction object */
  static customEmoji (id: string): Interfaces.TelegramReactionTypeCustomEmoji {
    return {
      type: 'custom_emoji',
      custom_emoji_id: id
    }
  }
}
