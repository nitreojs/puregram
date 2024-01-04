import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../../generated/telegram-interfaces'

import { User } from '../user'

import { ChatBoostSource } from './chat-boost-source'
import { memoizeGetters } from '../../../utils/helpers'

/** The boost was obtained by the creation of a Telegram Premium giveaway. This boosts the chat 4 times for the duration of the corresponding Telegram Premium subscription. */
@Inspectable()
export class ChatBoostSourceGiveaway extends ChatBoostSource {
  constructor (public payload: Interfaces.TelegramChatBoostSourceGiveaway) {
    super(payload)
  }

  /** Source of the boost, always `giveaway` */
  @Inspect()
  get source () {
    return this.payload.source
  }

  get giveawayMessageId () {
    return this.payload.giveaway_message_id
  }

  /** User that boosted the chat */
  @Inspect({ nullable: false })
  get user () {
    const { user } = this.payload

    if (!user) {
      return
    }

    return new User(user)
  }

  /** `true`, if the giveaway was completed, but there was no user to win the prize */
  @Inspect({ compute: true, nullable: false })
  isUnclaimed () {
    return this.payload.is_unclaimed
  }
}

memoizeGetters(ChatBoostSourceGiveaway, ['user'])
