import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents the bot's short description. */
@Inspectable()
export class BotShortDescription implements Structure {
  constructor (public payload: Interfaces.TelegramBotShortDescription) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** The bot's short description */
  @Inspect()
  get description () {
    return this.payload.short_description
  }

  toJSON () {
    return this.payload
  }
}
