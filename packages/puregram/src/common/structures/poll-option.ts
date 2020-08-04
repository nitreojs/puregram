import { inspectable } from 'inspectable';

import { TelegramPollOption } from '../../interfaces';

/** This object contains information about one answer option in a poll. */
export class PollOption {
  private payload: TelegramPollOption;

  constructor(payload: TelegramPollOption) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Option text, 1-100 characters */
  public get text(): string {
    return this.payload.text;
  }

  /** Number of users that voted for this option */
  public get voterCount(): number {
    return this.payload.voter_count;
  }
}

inspectable(PollOption, {
  serialize(option: PollOption) {
    return {
      text: option.text,
      voterCount: option.voterCount
    };
  }
});
