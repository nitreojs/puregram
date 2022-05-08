import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { MessageEntity } from './message-entity'
import { PollOption } from './poll-option'

/** This object contains information about a poll. */
export class Poll {
  constructor(public payload: Interfaces.TelegramPoll) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Unique poll identifier */
  get id() {
    return this.payload.id
  }

  /** Poll question, `1-300` characters */
  get question() {
    return this.payload.question
  }

  /** List of poll options */
  get options() {
    return this.payload.options.map(
      (option: Interfaces.TelegramPollOption) => new PollOption(option)
    )
  }

  /** Total number of users that voted in the poll */
  get totalVoterCount() {
    return this.payload.total_voter_count
  }

  /** `true`, if the poll is closed */
  get isClosed() {
    return this.payload.is_closed
  }

  /** `true`, if the poll is anonymous */
  get isAnonymous() {
    return this.payload.is_anonymous
  }

  /** Poll type, currently can be `regular` or `quiz` */
  get type() {
    return this.payload.type
  }

  /** `true`, if the poll allows multiple answers */
  get allowsMultipleAnswers() {
    return this.payload.allows_multiple_answers
  }

  /**
   * 0-based identifier of the correct answer option. Available only for polls
   * in the quiz mode, which are closed, or was sent (not forwarded) by the bot
   * or to the private chat with the bot.
   */
  get correctOptionId() {
    return this.payload.correct_option_id
  }

  /**
   * Text that is shown when a user chooses an incorrect answer or taps on the
   * lamp icon in a quiz-style poll, 0-200 characters
   */
  get explanation() {
    return this.payload.explanation
  }

  /**
   * Special entities like usernames, URLs, bot commands, etc. that appear in
   * the explanation
   */
  get explanationEntities() {
    const { explanation_entities } = this.payload

    if (!explanation_entities) {
      return []
    }

    return explanation_entities.map(
      (entity: Interfaces.TelegramMessageEntity) => new MessageEntity(entity)
    )
  }

  /** Amount of time in seconds the poll will be active after creation */
  get openPeriod() {
    return this.payload.open_period
  }

  /**
   * Point in time (Unix timestamp) when the poll will be automatically closed
   */
  get closeDate() {
    return this.payload.close_date
  }
}

inspectable(Poll, {
  serialize(poll) {
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
    }

    return filterPayload(payload)
  }
})
