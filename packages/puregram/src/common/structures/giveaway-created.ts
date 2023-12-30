import { Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about the creation of a scheduled giveaway. Currently holds no information. */
@Inspectable()
export class GiveawayCreated implements Structure {
  constructor (public payload: Interfaces.TelegramGiveawayCreated) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  toJSON () {
    return this.payload
  }
}
