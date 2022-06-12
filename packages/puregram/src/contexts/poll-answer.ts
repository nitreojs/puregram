import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { applyMixins } from '../utils/helpers'
import { Telegram } from '../telegram'
import { PollAnswer } from '../updates/'

import { Context } from './context'
import { SendMixin } from './mixins'

interface PollAnswerContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramPollAnswer
  updateId: number
}

class PollAnswerContext extends Context {
  payload: Interfaces.TelegramPollAnswer

  constructor(options: PollAnswerContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'poll_answer',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  clone(options?: PollAnswerContextOptions) {
    return new PollAnswerContext({
      telegram: this.telegram,
      payload: this.payload,
      updateId: this.updateId!,
      update: this.update!,
      ...options
    })
  }
}

// @ts-expect-error [senderId: number] is not compatible with [senderId: number | undefined] :shrug:
interface PollAnswerContext extends PollAnswer, SendMixin { }
applyMixins(PollAnswerContext, [PollAnswer, SendMixin])

inspectable(PollAnswerContext, {
  serialize(context) {
    return {
      pollId: context.pollId,
      user: context.user,
      senderId: context.senderId,
      optionIds: context.optionIds
    }
  }
})

export { PollAnswerContext }
