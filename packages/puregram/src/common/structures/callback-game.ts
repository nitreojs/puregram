import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** A placeholder, currently holds no information. */
@Inspectable()
export class CallbackGame implements Structure {
  constructor (public payload: Interfaces.TelegramCallbackGame) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  toJSON () {
    return this.payload
  }
}
