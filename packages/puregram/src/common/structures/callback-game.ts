import { inspectable } from 'inspectable'

import { TelegramCallbackGame } from '../../telegram-interfaces'

/** A placeholder, currently holds no information. */
export class CallbackGame {
  constructor(private payload: TelegramCallbackGame) { }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }
}

inspectable(CallbackGame, {
  serialize(game: CallbackGame) {
    return {}
  }
})
