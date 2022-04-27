import { inspectable } from 'inspectable'

import { TelegramBotCommand } from '../../generated/telegram-interfaces'

export class BotCommand {
  constructor(private payload: TelegramBotCommand) { }

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
  serialize(command: BotCommand) {
    return {
      command: command.command,
      description: command.description
    }
  }
})
