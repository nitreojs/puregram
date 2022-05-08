import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

export class BotCommand {
  constructor(private payload: Interfaces.TelegramBotCommand) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  get command() {
    return this.payload.command
  }

  get description() {
    return this.payload.description
  }
}

inspectable(BotCommand, {
  serialize(command) {
    return {
      command: command.command,
      description: command.description
    }
  }
})
