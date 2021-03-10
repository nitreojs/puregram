import { inspectable } from 'inspectable';

import { TelegramVoiceChatEnded } from '../../interfaces';

/** This object represents a service message about a voice chat ended in the chat. */
export class VoiceChatEnded {
  public payload: TelegramVoiceChatEnded;

  constructor(options: TelegramVoiceChatEnded) {
    this.payload = options;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Voice chat duration; in seconds */
  public get duration(): number {
    return this.payload.duration;
  }
}

inspectable(VoiceChatEnded, {
  serialize(event: VoiceChatEnded) {
    return {
      duration: event.duration
    };
  }
});
