import { inspectable } from 'inspectable';

import { TelegramVoiceChatStarted } from '../../interfaces';

/**
 * This object represents a service message about a voice chat started in the chat.
 * Currently holds no information.
 */
export class VoiceChatStarted {
  private options: TelegramVoiceChatStarted;

  constructor(options: TelegramVoiceChatStarted) {
    this.options = options;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }
}

inspectable(VoiceChatStarted, {
  serialize(event: VoiceChatStarted) {
    return {};
  }
});
