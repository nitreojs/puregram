let { inspect } = require('util');

let Context = require('./context');
let MessageEntity = require('../structures/message-entity');

class Poll extends Context {
  constructor(telegram, update) {
    super(telegram, 'poll');

    this.update = update;
  }

  get id() {
    return this.update.id;
  }

  get question() {
    return this.update.question;
  }

  get options() {
    return this.update.options;
  }

  get totalVoterCount() {
    return this.update.total_voter_count;
  }

  get isClosed() {
    return this.update.is_closed;
  }

  get isAnonymous() {
    return this.update.is_anonymous;
  }

  get type() {
    return this.update.type;
  }

  get allowsMultipleAnswers() {
    return this.update.allows_multiple_answers;
  }

  get correctOptionId() {
    return this.update.correct_option_id || null;
  }

  get explanation() {
    return this.update.explanation || null;
  }

  get explanationEntities() {
    let { explanation_entities } = this.update;

    if (!explanation_entities) return null;

    return explanation_entities.map(
      e => new MessageEntity(e),
    );
  }

  get openPeriod() {
    return this.update.open_period || null;
  }

  get closePeriod() {
    return this.update.close_period || null;
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

module.exports = Poll;
