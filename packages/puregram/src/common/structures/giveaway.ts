import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'
import { Chat } from './chat'

/** This object represents a message about a scheduled giveaway. */
@Inspectable()
export class Giveaway implements Structure {
  constructor (public payload: Interfaces.TelegramGiveaway) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** The list of chats which the user must join to participate in the giveaway */
  @Inspect()
  get chats () {
    return this.payload.chats.map(c => new Chat(c))
  }

  /** Point in time (Unix timestamp) when winners of the giveaway will be selected */
  @Inspect()
  get winnersSelectionDate () {
    return this.payload.winners_selection_date
  }

  /** The number of users which are supposed to be selected as winners of the giveaway */
  @Inspect()
  get winnerCount () {
    return this.payload.winner_count
  }

  /** `true`, if only users who join the chats after the giveaway started should be eligible to win */
  @Inspect({ nullable: false })
  get onlyNewMembers () {
    return this.payload.only_new_members
  }

  /** `true`, if the list of giveaway winners will be visible to everyone */
  @Inspect({ compute: true, nullable: false })
  hasPublicWinners () {
    return this.payload.public_winners
  }

  /** Description of additional giveaway prize */
  @Inspect({ nullable: false })
  get prizeDescription () {
    return this.payload.prize_description
  }

  /** A list of two-letter ISO 3166-1 alpha-2 country codes indicating the countries from which eligible users for the giveaway must come. If empty, then all users can participate in the giveaway. Users with a phone number that was bought on Fragment can always participate in giveaways. */
  @Inspect({ nullable: false })
  get countryCodes () {
    return this.payload.country_codes
  }

  /** The number of months the Telegram Premium subscription won from the giveaway will be active for */
  @Inspect({ nullable: false })
  get premiumSubscriptionMonthCount () {
    return this.payload.premium_subscription_month_count
  }

  toJSON (): Record<string, any> {
    return this.payload
  }
}
