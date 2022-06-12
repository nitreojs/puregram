import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'
import { Poll } from '../updates/'

import { Context } from './context'
import { CloneMixin } from './mixins'

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

interface PollContext extends Constructor<PollContext>, Poll, CloneMixin<PollContext, PollContextOptions> { }
applyMixins(PollContext, [Poll, CloneMixin])

inspectable(PollContext, {
  serialize(context) {
    const payload = {
      id: context.id,
      question: context.question,
      options: context.options,
      totalVoterCount: context.totalVoterCount,
      isClosed: context.isClosed,
      isAnonymous: context.isAnonymous,
      type: context.type,
      allowsMultipleAnswers: context.allowsMultipleAnswers,
      correctOptionId: context.correctOptionId,
      explanation: context.explanation,
      explanationEntities: context.explanationEntities,
      openPeriod: context.openPeriod,
      closeDate: context.closeDate
    }

    return filterPayload(payload)
  }
})

export { PollContext }
