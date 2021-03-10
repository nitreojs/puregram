import { inspectable } from 'inspectable';
import { TelegramMessageAutoDeleteTimerChanged } from '../../interfaces';

/** This object represents a service message about a change in auto-delete timer settings */
export class MessageAutoDeleteTimerChanged {
  public payload: TelegramMessageAutoDeleteTimerChanged;

  constructor(options: TelegramMessageAutoDeleteTimerChanged) {
    this.payload = options;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** New auto-delete time for messages in the chat */
  public get messageAutoDeleteTime(): number {
    return this.payload.message_auto_delete_time;
  }
}

inspectable(MessageAutoDeleteTimerChanged, {
  serialize(holyShitThatName: MessageAutoDeleteTimerChanged) {
    return {};
  }
});
