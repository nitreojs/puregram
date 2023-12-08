// eslint-disable-next-line max-classes-per-file
import { inspectable } from 'inspectable'

import { applyMixins, filterPayload, isParseable } from '../utils/helpers'

import { CallbackQuery } from '../common/structures'
import { Constructor, Require } from '../types/types'

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

  constructor (options: CallbackQueryContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'callback_query',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Checks if the query has `message` property */
  hasMessage (): this is Require<this, 'message'> {
    return this.payload.message !== undefined
  }

  /**
   * Message with the callback button that originated the query.
   * Note that message content and message date will not be available
   * if the message is too old
   */
  get message () {
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

  /** Checks if the query has `queryPayload` property */
  hasQueryPayload (): this is Require<this, 'queryPayload'> {
    return this.payload.data !== undefined
  }

  /**
   * Data associated with the callback button.
   * Be aware that a bad client can send arbitrary data in this field.
   */
  get queryPayload (): unknown {
    const { data } = this.payload

    if (data === undefined) {
      return
    }

    if (isParseable(data)) {
      return JSON.parse(data)
    }

    return data
  }

  /** Checks if the query has `inlineMessageId` property */
  hasInlineMessageId (): this is Require<this, 'inlineMessageId'> {
    return this.inlineMessageId !== undefined
  }

  /** Checks if the query has `data` property */
  hasData (): this is Require<this, 'data'> {
    return this.data !== undefined
  }

  /** Checks if the query has `gameShortName` property */
  hasGameShortName (): this is Require<this, 'gameShortName'> {
    return this.gameShortName !== undefined
  }

  /** Answers to current callback query */
  answerCallbackQuery (params?: Partial<Methods.AnswerCallbackQueryParams>) {
    return this.telegram.api.answerCallbackQuery({
      callback_query_id: this.id,
      ...params
    })
  }

  /** Answers to current callback query. An alias for `answerCallbackQuery` */
  answer (params?: Partial<Methods.AnswerCallbackQueryParams>) {
    return this.answerCallbackQuery(params)
  }
}

interface CallbackQueryContext extends Constructor<CallbackQueryContext>, CallbackQuery, CloneMixin<CallbackQueryContext, CallbackQueryContextOptions> { }
applyMixins(CallbackQueryContext, [CallbackQuery, CloneMixin])

inspectable(CallbackQueryContext, {
  serialize (context) {
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
