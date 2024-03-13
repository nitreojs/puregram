import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about a user boosting a chat. */
@Inspectable()
export class ChatBoostAdded implements Structure {
  constructor (public payload: Interfaces.TelegramChatBoostAdded) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Number of boosts added by the user */
  @Inspect()
  get boostCount () {
    return this.payload.boost_count
  }

  toJSON (): Record<string, any> {
    return this.payload
  }
}
