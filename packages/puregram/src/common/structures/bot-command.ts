import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** This object represents a bot command */
export class BotCommand {
  constructor(private payload: Interfaces.TelegramBotCommand) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Text of the command; 1-32 characters. Can contain only lowercase English letters, digits and underscores. */
  get command() {
    return this.payload.command
  }

  /** Description of the command; 1-256 characters */
  get description() {
    return this.payload.description
  }
}

inspectable(BotCommand, {
  serialize(struct) {
    return {
      command: struct.command,
      description: struct.description
    }
  }
})
