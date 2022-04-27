import { inspectable } from 'inspectable'

import { Context } from './context'

import { TelegramPoll, TelegramUpdate } from '../generated/telegram-interfaces'
import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { Poll } from '../updates/'

interface PollContextOptions {
  telegram: Telegram
  update: TelegramUpdate
  payload: TelegramPoll
  updateId: number
}

class PollContext extends Context {
  payload: TelegramPoll

  constructor(options: PollContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'poll',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

interface PollContext extends Poll { }
applyMixins(PollContext, [Poll])

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
    }

    return filterPayload(payload)
  }
})

export { PollContext }
