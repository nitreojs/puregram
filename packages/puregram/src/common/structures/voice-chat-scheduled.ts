import { inspectable } from 'inspectable';

import { TelegramVoiceChatScheduled } from '../../telegram-interfaces';

/**
 * This object represents a service message about a voice chat scheduled in the chat
 */
export class VoiceChatScheduled {
  public payload: TelegramVoiceChatScheduled;

  constructor(options: TelegramVoiceChatScheduled) {
    this.payload = options;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  public get startDate(): number {
    return this.payload.start_date;
  }
}

inspectable(VoiceChatScheduled, {
  serialize(event: VoiceChatScheduled) {
    return {
      startDate: event.startDate
    };
  }
});
