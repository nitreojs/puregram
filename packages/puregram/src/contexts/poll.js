let { inspect } = require('util');

let Context = require('./context');

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
      correctOptionId: this.correctOptionId
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = Poll;
