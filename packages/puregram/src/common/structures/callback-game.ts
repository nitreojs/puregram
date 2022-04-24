import { inspectable } from 'inspectable'

import { TelegramCallbackGame } from '../../telegram-interfaces'

/** A placeholder, currently holds no information. */
export class CallbackGame {
  constructor(private payload: TelegramCallbackGame) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }
}

inspectable(CallbackGame, {
  serialize(game: CallbackGame) {
    return {}
  }
})
