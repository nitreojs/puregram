import { inspectable } from 'inspectable'

import * as Methods from '../../generated/methods'
import * as Interfaces from '../../generated/telegram-interfaces'

/** This object represents an animated emoji that displays a random value. */
export class Dice {
  constructor(private payload: Interfaces.TelegramDice) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Emoji on which the dice throw animation is based */
  get emoji() {
    return this.payload.emoji! as Methods.SendDiceParams['emoji']
  }

  /**
   * Value of the dice,
   * `1-6` for `🎲`, `🎯` and `🎳` base emoji,
   * `1-5` for `🏀` and `⚽️` base emoji,
   * `1-64` for `🎰` base emoji
   */
  get value() {
    return this.payload.value
  }
}

inspectable(Dice, {
  serialize(struct) {
    return {
      emoji: struct.emoji,
      value: struct.value
    }
  }
})
