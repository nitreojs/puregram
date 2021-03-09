import { inspectable } from 'inspectable';

import { TelegramVoiceChatParticipantsInvited } from '../../interfaces';
import { User } from './user';

/** This object represents a service message about new members invited to a voice chat. */
export class VoiceChatParticipantsInvited {
  private options: TelegramVoiceChatParticipantsInvited;

  constructor(options: TelegramVoiceChatParticipantsInvited) {
    this.options = options;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** New members that were invited to the voice chat */
  public get users(): User[] {
    return (this.options.users ?? []).map(
      (payload) => new User(payload)
    );
  }
}

inspectable(VoiceChatParticipantsInvited, {
  serialize(event: VoiceChatParticipantsInvited) {
    return {};
  }
});
