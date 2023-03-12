import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents the bot's short description. */
export class BotShortDescription implements Structure {
  constructor (public payload: Interfaces.TelegramBotShortDescription) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** The bot's short description */
  get description () {
    return this.payload.short_description
  }

  toJSON (): Interfaces.TelegramBotShortDescription {
    return {
      short_description: this.description
    }
  }
}

inspectable(BotShortDescription, {
  serialize (struct) {
    return {
      description: struct.description
    }
  }
})
