import * as Interfaces from '../../../generated/telegram-interfaces'

import { ReactionType } from './reaction-type'

export class ReactionTypeCustomEmoji extends ReactionType {
  constructor (public payload: Interfaces.TelegramReactionTypeCustomEmoji) {
    super(payload)
  }

  /** Type of the reaction, always `custom_emoji` */
  get type () {
    return this.payload.type
  }

  /** Custom emoji identifier */
  get customEmoji () {
    return this.payload.custom_emoji
  }
}
