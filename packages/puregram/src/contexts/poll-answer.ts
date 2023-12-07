import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { applyMixins } from '../utils/helpers'
import { Constructor, Require } from '../types/types'
import { Telegram } from '../telegram'
import { PollAnswer } from '../common/structures'

import { Context } from './context'
import { SendMixin, ChatActionMixin, CloneMixin } from './mixins'

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

  /** Checks whether the current answer was non-anonymous and contains `user` field */
  isFromUser (): this is Require<this, 'user'> {
    return this.user !== undefined
  }

  /** Checks if current answer was answered anonymously and the `voterChat` is available */
  isFromChat (): this is Require<this, 'voterChat'> {
    return this.voterChat !== undefined
  }
}

// @ts-expect-error [senderId: number] is not compatible with [senderId: number | undefined] :shrug:
interface PollAnswerContext extends Constructor<PollAnswerContext>, PollAnswer, SendMixin, ChatActionMixin, CloneMixin<PollAnswerContext, PollAnswerContextOptions> { }
applyMixins(PollAnswerContext, [PollAnswer, SendMixin, ChatActionMixin, CloneMixin])

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
