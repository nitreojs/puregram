import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { ChosenInlineResult } from '../common/structures'
import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { Constructor, Require } from '../types/types'

import { Context } from './context'
import { SendMixin, CloneMixin } from './mixins'

interface ChosenInlineResultContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramChosenInlineResult
  updateId: number
}

/**
 * The result of an inline query that was chosen by
 * a user and sent to their chat partner
 */
class ChosenInlineResultContext extends Context {
  payload: Interfaces.TelegramChosenInlineResult

  constructor (options: ChosenInlineResultContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'chosen_inline_result',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Checks if the result has `location` property */
  hasLocation (): this is Require<ChosenInlineResultContext, 'location'> {
    return this.location !== undefined
  }

  /** Checks if the query has `inlineMessageId` property */
  hasInlineMessageId (): this is Require<ChosenInlineResultContext, 'inlineMessageId'> {
    return this.inlineMessageId !== undefined
  }
}

// @ts-expect-error [senderId: number] is not compatible with [senderId: number | undefined] :shrug:
interface ChosenInlineResultContext extends Constructor<ChosenInlineResultContext>, ChosenInlineResult, SendMixin, CloneMixin<ChosenInlineResultContext, ChosenInlineResultContextOptions> { }
applyMixins(ChosenInlineResultContext, [ChosenInlineResult, SendMixin, CloneMixin])

inspectable(ChosenInlineResultContext, {
  serialize (result) {
    const payload = {
      resultId: result.resultId,
      from: result.from,
      senderId: result.senderId,
      location: result.location,
      inlineMessageId: result.inlineMessageId,
      query: result.query
    }

    return filterPayload(payload)
  }
})

export { ChosenInlineResultContext }
