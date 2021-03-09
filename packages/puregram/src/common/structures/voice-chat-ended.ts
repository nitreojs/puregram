import { inspectable } from 'inspectable';

import { TelegramVoiceChatEnded } from '../../interfaces';

/** This object represents a service message about a voice chat ended in the chat. */
export class VoiceChatEnded {
  private options: TelegramVoiceChatEnded;

  constructor(options: TelegramVoiceChatEnded) {
    this.options = options;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Voice chat duration; in seconds */
  public get duration(): number {
    return this.options.duration;
  }
}

inspectable(VoiceChatEnded, {
  serialize(event: VoiceChatEnded) {
    return {
      duration: event.duration
    };
  }
});
