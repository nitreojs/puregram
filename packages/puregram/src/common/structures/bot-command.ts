import { inspectable } from 'inspectable';

import { TelegramBotCommand } from '../../interfaces';

export class BotCommand {
  private payload: TelegramBotCommand;

  constructor(payload: TelegramBotCommand) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  public get command(): string {
    return this.payload.command;
  }

  public get description(): string {
    return this.payload.description;
  }
}

inspectable(BotCommand, {
  serialize(command: BotCommand) {
    return {
      command: command.command,
      description: command.description
    };
  }
});
