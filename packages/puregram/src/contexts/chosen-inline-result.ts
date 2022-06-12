import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { ChosenInlineResult } from '../updates/'
import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'

import { Context } from './context'
import { SendMixin } from './mixins'

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

  constructor(options: ChosenInlineResultContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'chosen_inline_result',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  clone(options?: ChosenInlineResultContextOptions) {
    return new ChosenInlineResultContext({
      telegram: this.telegram,
      payload: this.payload,
      updateId: this.updateId!,
      update: this.update!,
      ...options
    })
  }
}

// @ts-expect-error [senderId: number] is not compatible with [senderId: number | undefined] :shrug:
interface ChosenInlineResultContext extends ChosenInlineResult, SendMixin { }
applyMixins(ChosenInlineResultContext, [ChosenInlineResult, SendMixin])

inspectable(ChosenInlineResultContext, {
  serialize(result) {
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
