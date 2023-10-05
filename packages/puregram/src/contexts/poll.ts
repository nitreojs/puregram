import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { Constructor, Require, RequireValue } from '../types/types'
import { Poll } from '../common/structures'

import { Context } from './context'
import { CloneMixin } from './mixins'
import { PollType } from '../types/enums'

interface PollContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramPoll
  updateId: number
}

class PollContext extends Context {
  payload: Interfaces.TelegramPoll

  constructor (options: PollContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'poll',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Returns `true` if current poll is a regular one */
  isRegular (): this is RequireValue<this, 'type', PollType.Regular> {
    return this.type === PollType.Regular
  }

  /** Returns `true` if current poll is a quiz */
  isQuiz (): this is RequireValue<this, 'type', PollType.Quiz> {
    return this.type === PollType.Quiz
  }

  /** Checks if poll has `correctOptionId` property */
  hasCorrectOptionId (): this is Require<this, 'correctOptionId'> {
    return this.correctOptionId !== undefined
  }

  /** Checks if poll has `explanation` property */
  hasExplanation (): this is Require<this, 'explanation'> {
    return this.explanation !== undefined
  }

  /** Checks if poll has `explanationEntities` property */
  hasExplanationEntities (): this is Require<this, 'explanationEntities'> {
    return this.explanationEntities !== undefined
  }

  /** Checks if poll has `openPeriod` property */
  hasOpenPeriod (): this is Require<this, 'openPeriod'> {
    return this.openPeriod !== undefined
  }

  /** Checks if poll has `closeDate` property */
  hasCloseDate (): this is Require<this, 'closeDate'> {
    return this.closeDate !== undefined
  }
}

// TODO: why the fuck is this not a Message.poll?
interface PollContext extends Constructor<PollContext>, Poll, CloneMixin<PollContext, PollContextOptions> { }
applyMixins(PollContext, [Poll, CloneMixin])

inspectable(PollContext, {
  serialize (context) {
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
