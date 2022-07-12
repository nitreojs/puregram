import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'
import { Telegram } from '../telegram'
import { PollAnswer } from '../updates/'

import { Context } from './context'
import { SendMixin, CloneMixin } from './mixins'

interface PollAnswerContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramPollAnswer
  updateId: number
}

class PollAnswerContext extends Context {
  payload: Interfaces.TelegramPollAnswer

  constructor (options: PollAnswerContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'poll_answer',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

// @ts-expect-error [senderId: number] is not compatible with [senderId: number | undefined] :shrug:
interface PollAnswerContext extends Constructor<PollAnswerContext>, PollAnswer, SendMixin, CloneMixin<PollAnswerContext, PollAnswerContextOptions> { }
applyMixins(PollAnswerContext, [PollAnswer, SendMixin, CloneMixin])

inspectable(PollAnswerContext, {
  serialize (context) {
    return {
      pollId: context.pollId,
      user: context.user,
      senderId: context.senderId,
      optionIds: context.optionIds
    }
  }
})

export { PollAnswerContext }
