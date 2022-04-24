// eslint-disable-next-line max-classes-per-file
import { inspectable } from 'inspectable'

import { applyMixins, filterPayload, isParseable } from '../utils/helpers'

import { CallbackQuery } from '../updates/'

import { TelegramCallbackQuery, TelegramUpdate } from '../telegram-interfaces'

import { Telegram } from '../telegram'
import { AnswerCallbackQueryParams } from '../methods'

import { Context } from './context'
import { MessageContext } from './message'

interface CallbackQueryContextOptions {
  telegram: Telegram
  update: TelegramUpdate
  payload: TelegramCallbackQuery
  updateId: number
}

/** Called when `callback_query` event occurs */
class CallbackQueryContext extends Context {
  payload: TelegramCallbackQuery

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
  get message(): MessageContext | undefined {
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
  get queryPayload(): any {
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
  answerCallbackQuery(
    params?: Partial<AnswerCallbackQueryParams>
  ): Promise<true> {
    return this.telegram.api.answerCallbackQuery({
      ...params,
      callback_query_id: this.id
    })
  }
}

class TempCallbackQueryContext extends CallbackQueryContext { }

interface CallbackQueryContext extends CallbackQuery { }
applyMixins(TempCallbackQueryContext, [CallbackQuery, CallbackQueryContext])

inspectable(CallbackQueryContext, {
  serialize(query: CallbackQueryContext) {
    const payload = {
      id: query.id,
      senderId: query.senderId,
      from: query.from,
      message: query.message,
      inlineMessageId: query.inlineMessageId,
      chatInstance: query.chatInstance,
      queryPayload: query.queryPayload,
      gameShortName: query.gameShortName
    }

    return filterPayload(payload)
  }
})

export { TempCallbackQueryContext as CallbackQueryContext }
