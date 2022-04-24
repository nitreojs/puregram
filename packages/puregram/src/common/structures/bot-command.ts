import { inspectable } from 'inspectable'

import { TelegramBotCommand } from '../../telegram-interfaces'

export class BotCommand {
  constructor(private payload: TelegramBotCommand) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  get command(): string {
    return this.payload.command
  }

  get description(): string {
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
