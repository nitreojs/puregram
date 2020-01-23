let { inspect } = require('util');

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
    return this.payload.options;
  }

  get totalVoterCount() {
    return this.payload.total_voter_count;
  }

  get isClosed() {
    return this.payload.isClosed;
  }

  get isAnonymous() {
    return this.payload.is_anonymous;
  }

  get type() {
    return this.payload.type;
  }

  get allowsMultipleAnswers() {
    return this.payload.allows_multiple_answers;
  }

  get correctOptionId() {
    return this.payload.correct_iption_id || null;
  }

  toString() {
    return this.id;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      iq: this.iq,
      question: this.question,
      options: this.options,
      isClosed: this.isClosed,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} <${options.stylize(this.toString(), 'string')}> ${payload}`;
  }
}

module.exports = PollAttachment;
