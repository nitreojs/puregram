// eslint-disable-next-line max-classes-per-file
import { inspectable } from 'inspectable'

import { applyMixins, filterPayload, isParseable } from '../utils/helpers'

import { CallbackQuery } from '../updates/'
import { Constructor } from '../types/types'

import * as Interfaces from '../generated/telegram-interfaces'
import * as Methods from '../generated/methods'

import { Telegram } from '../telegram'

import { Context } from './context'
import { MessageContext } from './message'
import { CloneMixin } from './mixins'

interface CallbackQueryContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramCallbackQuery
  updateId: number
}

/** Called when `callback_query` event occurs */
class CallbackQueryContext extends Context {
  payload: Interfaces.TelegramCallbackQuery

  constructor(options: CallbackQueryContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'callback_query',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /**
   * Message with the callback button that originated the query.
   * Note that message content and message date will not be available
   * if the message is too old
   */
  get message() {
    if (this.payload.message === undefined) {
      return
    }

    return new MessageContext({
      telegram: this.telegram,
      update: this.update,
      payload: this.payload.message,
      updateId: this.update?.update_id
    })
  }

  /**
   * Data associated with the callback button.
   * Be aware that a bad client can send arbitrary data in this field.
   */
  get queryPayload() {
    const { data } = this.payload

    if (data === undefined) {
      return
    }

    if (isParseable(data)) {
      return JSON.parse(data)
    }

    return data
  }

  /** Answers to current callback query */
  answerCallbackQuery(params?: Partial<Methods.AnswerCallbackQueryParams>) {
    return this.telegram.api.answerCallbackQuery({
      callback_query_id: this.id,
      ...params
    })
  }
}

interface CallbackQueryContext extends Constructor<CallbackQueryContext>, CallbackQuery, CloneMixin<CallbackQueryContext, CallbackQueryContextOptions> { }
applyMixins(CallbackQueryContext, [CallbackQuery, CloneMixin])

inspectable(CallbackQueryContext, {
  serialize(context) {
    const payload = {
      id: context.id,
      senderId: context.senderId,
      from: context.from,
      message: context.message,
      inlineMessageId: context.inlineMessageId,
      chatInstance: context.chatInstance,
      queryPayload: context.queryPayload,
      gameShortName: context.gameShortName
    }

    return filterPayload(payload)
  }
})

export { CallbackQueryContext }
