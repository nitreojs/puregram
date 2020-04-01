let { inspect } = require('util');

let Context = require('./context');

let User = require('../structures/user');

class PollAnswer extends Context {
  constructor(telegram, update) {
    super(telegram, 'poll_answer');

    this.update = update;
  }

  get pollId() {
    return this.update.poll_id;
  }

  get user() {
    let { user } = this.update;

    if (!user) return null;

    return new User(user);
  }

  get optionIds() {
    return this.update.option_ids;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      pollId: this.pollId,
      user: this.user,
      optionIds: this.optionIds,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = PollAnswer;
