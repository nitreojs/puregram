import { inspectable } from 'inspectable';

import { TelegramVoiceChatParticipantsInvited } from '../../telegram-interfaces';
import { User } from './user';

/** This object represents a service message about new members invited to a voice chat. */
export class VoiceChatParticipantsInvited {
  public payload: TelegramVoiceChatParticipantsInvited;

  constructor(options: TelegramVoiceChatParticipantsInvited) {
    this.payload = options;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** New members that were invited to the voice chat */
  public get users(): User[] {
    return (this.payload.users ?? []).map(
      (payload) => new User(payload)
    );
  }
}

inspectable(VoiceChatParticipantsInvited, {
  serialize(event: VoiceChatParticipantsInvited) {
    return {};
  }
});
