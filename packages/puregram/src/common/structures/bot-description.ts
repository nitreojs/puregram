import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents the bot's description. */
@Inspectable()
export class BotDescription implements Structure {
  constructor (public payload: Interfaces.TelegramBotDescription) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** The bot's description */
  @Inspect()
  get description () {
    return this.payload.description
  }

  toJSON () {
    return this.payload
  }
}
