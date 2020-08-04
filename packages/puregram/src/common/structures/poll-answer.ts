import { inspectable } from 'inspectable';

import { TelegramPollAnswer } from '../../interfaces';
import { User } from './user';

/** This object represents an answer of a user in a non-anonymous poll. */
export class PollAnswer {
  public payload: TelegramPollAnswer;

  constructor(payload: TelegramPollAnswer) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Unique poll identifier */
  public get pollId(): string {
    return this.payload.poll_id;
  }

  /** The user, who changed the answer to the poll */
  public get user(): User {
    return new User(this.payload.user);
  }

  /** Sender ID */
  public get senderId(): number {
    return this.user.id;
  }

  /**
   * 0-based identifiers of answer options, chosen by the user.
   * May be empty if the user retracted their vote.
   */
  public get optionIds(): number[] {
    return this.payload.option_ids;
  }
}

inspectable(PollAnswer, {
  serialize(answer: PollAnswer) {
    return {
      pollId: answer.pollId,
      user: answer.user,
      senderId: answer.senderId,
      optionIds: answer.optionIds
    };
  }
});
