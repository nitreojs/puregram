import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import * as Methods from '../generated/methods'

import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'
import { InlineQuery } from '../common/structures'

import { Context } from './context'
import { CloneMixin } from './mixins'

interface InlineQueryContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramInlineQuery
  updateId: number
}

class InlineQueryContext extends Context {
  payload: Interfaces.TelegramInlineQuery

  constructor (options: InlineQueryContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'inline_query',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Sender's ID */
  get senderId () {
    return this.from.id
  }

  /** Answers to inline query */
  answerInlineQuery (
    results: Interfaces.TelegramInlineQueryResult[],
    params?: Partial<Methods.AnswerInlineQueryParams>
  ) {
    return this.telegram.api.answerInlineQuery({
      inline_query_id: this.id,
      results,
      ...params
    })
  }
}

interface InlineQueryContext extends Constructor<InlineQueryContext>, InlineQuery, CloneMixin<InlineQueryContext, InlineQueryContextOptions> { }
applyMixins(InlineQueryContext, [InlineQuery, CloneMixin])

inspectable(InlineQueryContext, {
  serialize (context) {
    const payload = {
      id: context.id,
      senderId: context.senderId,
      from: context.from,
      location: context.location,
      query: context.query,
      offset: context.offset
    }

    return filterPayload(payload)
  }
})

export { InlineQueryContext }
