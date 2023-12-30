import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'
import { Chat } from './chat'
import { User } from './user'

/** This object represents a message about the completion of a giveaway with public winners. */
@Inspectable()
export class GiveawayWinners implements Structure {
  constructor (public payload: Interfaces.TelegramGiveawayWinners) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** The chat that created the giveaway */
  get chat () {
    return new Chat(this.payload.chat)
  }

  /** Identifier of the message with the giveaway in the chat */
  get messageId () {
    return this.payload.giveaway_message_id
  }

  /** Point in time (Unix timestamp) when winners of the giveaway were selected */
  @Inspect()
  get winnersSelectionDate () {
    return this.payload.winners_selection_date
  }

  /** Total number of winners in the giveaway */
  @Inspect()
  get winnerCount () {
    return this.payload.winner_count
  }

  /** List of up to 100 winners of the giveaway */
  @Inspect()
  get winners () {
    return this.payload.winners.map(w => new User(w))
  }

  /** The number of other chats the user had to join in order to be eligible for the giveaway */
  @Inspect({ nullable: false })
  get additionalChatCount () {
    return this.payload.additional_chat_count
  }

  /** The number of months the Telegram Premium subscription won from the giveaway will be active for */
  @Inspect({ nullable: false })
  get premiumSubscriptionMonthCount () {
    return this.payload.premium_subscription_month_count
  }

  /** Number of undistributed prizes */
  get unclaimedPrizeCount () {
    return this.payload.unclaimed_prize_count
  }

  /** `true`, if only users who had joined the chats after the giveaway started were eligible to win */
  @Inspect({ nullable: false })
  get onlyNewMembers () {
    return this.payload.only_new_members
  }

  /** `true`, if the giveaway was canceled because the payment for it was refunded */
  @Inspect({ compute: true, nullable: false })
  wasRefunded () {
    return this.payload.was_refunded
  }

  /** Description of additional giveaway prize */
  @Inspect({ nullable: false })
  get prizeDescription () {
    return this.payload.prize_description
  }

  toJSON () {
    return this.payload
  }
}
