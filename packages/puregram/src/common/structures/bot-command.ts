import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a bot command */
@Inspectable()
export class BotCommand implements Structure {
  constructor (public payload: Interfaces.TelegramBotCommand) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Text of the command; 1-32 characters. Can contain only lowercase English letters, digits and underscores. */
  @Inspect()
  get command () {
    return this.payload.command
  }

  /** Description of the command; 1-256 characters */
  @Inspect()
  get description () {
    return this.payload.description
  }

  toJSON () {
    return this.payload
  }
}
