import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents the bot's description. */
export class BotDescription implements Structure {
  constructor (public payload: Interfaces.TelegramBotDescription) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** The bot's description */
  get description () {
    return this.payload.description
  }

  toJSON (): Interfaces.TelegramBotDescription {
    return {
      description: this.description
    }
  }
}

inspectable(BotDescription, {
  serialize (struct) {
    return {
      description: struct.description
    }
  }
})
