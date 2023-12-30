import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about the completion of a giveaway without public winners. */
@Inspectable()
export class GiveawayCompleted implements Structure {
  constructor (public payload: Interfaces.TelegramGiveawayCompleted) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Number of winners in the giveaway */
  @Inspect()
  get winnerCount () {
    return this.payload.winner_count
  }

  /** Number of undistributed prizes */
  @Inspect({ nullable: false })
  get unclaimedPrizeCount () {
    return this.payload.unclaimed_prize_count
  }

  /** Message with the giveaway that was completed, if it wasn't deleted */
  @Inspect({ nullable: false })
  get message () {
    return this.payload.giveaway_message
  }

  toJSON () {
    return this.payload
  }
}
