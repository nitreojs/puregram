import { inspectable } from 'inspectable';

import { TelegramPoll, TelegramPollOption, TelegramMessageEntity } from '../../interfaces';
import { PollType } from '../../types';
import { MessageEntity } from './message-entity';
import { PollOption } from './poll-option';
import { filterPayload } from '../../utils/helpers';

/** This object contains information about a poll. */
export class Poll {
  public payload: TelegramPoll;

  constructor(payload: TelegramPoll) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Unique poll identifier */
  public get id(): string {
    return this.payload.id;
  }

  /** Poll question, `1-300` characters */
  public get question(): string {
    return this.payload.question;
  }

  /** List of poll options */
  public get options(): PollOption[] {
    return this.payload.options.map(
      (option: TelegramPollOption) => new PollOption(option)
    );
  }

  /** Total number of users that voted in the poll */
  public get totalVoterCount(): number {
    return this.payload.total_voter_count;
  }

  /** `true`, if the poll is closed */
  public get isClosed(): boolean {
    return this.payload.is_closed;
  }

  /** `true`, if the poll is anonymous */
  public get isAnonymous(): boolean {
    return this.payload.is_anonymous;
  }

  /** Poll type, currently can be `regular` or `quiz` */
  public get type(): PollType {
    return this.payload.type;
  }

  /** `true`, if the poll allows multiple answers */
  public get allowsMultipleAnswers(): boolean {
    return this.payload.allows_multiple_answers;
  }

  /**
   * 0-based identifier of the correct answer option. Available only for polls
   * in the quiz mode, which are closed, or was sent (not forwarded) by the bot
   * or to the private chat with the bot.
   */
  public get correctOptionId(): number | undefined {
    return this.payload.correct_option_id;
  }

  /**
   * Text that is shown when a user chooses an incorrect answer or taps on the
   * lamp icon in a quiz-style poll, 0-200 characters
   */
  public get explanation(): string | undefined {
    return this.payload.explanation;
  }

  /**
   * Special entities like usernames, URLs, bot commands, etc. that appear in
   * the explanation
   */
  public get explanationEntities(): MessageEntity[] {
    const { explanation_entities } = this.payload;

    if (!explanation_entities) return [];

    return explanation_entities.map(
      (entity: TelegramMessageEntity) => new MessageEntity(entity)
    );
  }

  /** Amount of time in seconds the poll will be active after creation */
  public get openPeriod(): number | undefined {
    return this.payload.open_period;
  }

  /**
   * Point in time (Unix timestamp) when the poll will be automatically closed
   */
  public get closeDate(): number | undefined {
    return this.payload.close_date;
  }
}

inspectable(Poll, {
  serialize(poll: Poll) {
    const payload = {
      id: poll.id,
      question: poll.question,
      options: poll.options,
      totalVoterCount: poll.totalVoterCount,
      isClosed: poll.isClosed,
      isAnonymous: poll.isAnonymous,
      type: poll.type,
      allowsMultipleAnswers: poll.allowsMultipleAnswers,
      correctOptionId: poll.correctOptionId,
      explanation: poll.explanation,
      explanationEntities: poll.explanationEntities,
      openPeriod: poll.openPeriod,
      closeDate: poll.closeDate
    };

    return filterPayload(payload);
  }
});
