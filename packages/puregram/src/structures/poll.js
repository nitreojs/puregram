let { inspect } = require('util');

let PollOption = require('./poll-option')
let MessageEntity = require('./message-entity');

class PollAttachment {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return 'poll';
  }

  get id() {
    return this.payload.id;
  }

  get question() {
    return this.payload.question;
  }

  get options() {
    return this.payload.options.map(
      option => new PollOption(option)
    );
  }

  get totalVoterCount() {
    return this.payload.total_voter_count;
  }

  get isClosed() {
    return this.payload.is_closed;
  }

  get isAnonymous() {
    return this.payload.is_anonymous;
  }

  get pollType() {
    return this.payload.type;
  }

  get allowsMultipleAnswers() {
    return this.payload.allows_multiple_answers;
  }

  get correctOptionId() {
    return this.payload.correct_option_id || null;
  }

  get explanation() {
    return this.payload.explanation || null;
  }

  get explanationEntities() {
    let { explanation_entities } = this.payload;

    if (!explanation_entities) return null;

    return explanation_entities.map(
      e => new MessageEntity(e),
    );
  }

  get openPeriod() {
    return this.payload.open_period || null;
  }

  get closePeriod() {
    return this.payload.close_period || null;
  }

  toString() {
    return this.id;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      id: this.id,
      question: this.question,
      options: this.options,
      totalVoterCount: this.totalVoterCount,
      isClosed: this.isClosed,
      isAnonymous: this.isAnonymous,
      type: this.type,
      allowsMultipleAnswers: this.allowsMultipleAnswers,
      correctOptionId: this.correctOptionId,
      explanation: this.explanation,
      explanationEntities: this.explanationEntities,
      openPeriod: this.openPeriod,
      closePeriod: this.closePeriod
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = PollAttachment;
