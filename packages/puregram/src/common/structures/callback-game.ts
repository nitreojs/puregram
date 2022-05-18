import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** A placeholder, currently holds no information. */
export class CallbackGame {
  constructor(private payload: Interfaces.TelegramCallbackGame) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }
}

inspectable(CallbackGame, {
  serialize(struct) {
    return {}
  }
})
