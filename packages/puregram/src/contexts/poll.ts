import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { Poll } from '../updates/'

import { Context } from './context'

interface PollContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramPoll
  updateId: number
}

class PollContext extends Context {
  payload: Interfaces.TelegramPoll

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

export { PollContext }
