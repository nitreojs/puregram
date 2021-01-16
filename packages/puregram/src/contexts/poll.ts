import { inspectable } from 'inspectable';

import { Context } from './context';

import { TelegramPoll } from '../interfaces';
import { Telegram } from '../telegram';
import { filterPayload, applyMixins } from '../utils/helpers';
import { Poll } from '../updates/';

class PollContext extends Context {
  public payload: TelegramPoll;

  constructor(telegram: Telegram, update: TelegramPoll) {
    super(telegram, 'poll');

    this.payload = update;
  }
}

interface PollContext extends Poll { }
applyMixins(PollContext, [Poll]);

inspectable(PollContext, {
  serialize(poll: PollContext) {
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

export { PollContext };
