import { Inspect, Inspectable } from 'inspectable'

import * as Methods from '../../generated/methods'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents an animated emoji that displays a random value. */
@Inspectable()
export class Dice implements Structure {
  constructor (public payload: Interfaces.TelegramDice) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Emoji on which the dice throw animation is based */
  @Inspect()
  get emoji () {
    return this.payload.emoji as NonNullable<Methods.SendDiceParams['emoji']>
  }

  /**
   * Value of the dice,
   * `1-6` for `🎲`, `🎯` and `🎳` base emoji,
   * `1-5` for `🏀` and `⚽️` base emoji,
   * `1-64` for `🎰` base emoji
   */
  @Inspect()
  get value () {
    return this.payload.value
  }

  toJSON () {
    return this.payload
  }
}
