import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** A placeholder, currently holds no information. */
export class CallbackGame implements Structure {
  constructor (public payload: Interfaces.TelegramCallbackGame) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  toJSON () {
    return this.payload
  }
}

inspectable(CallbackGame, {
  serialize (struct) {
    return {}
  }
})
