import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import * as Methods from '../generated/methods'

import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { InlineQuery } from '../updates/inline-query'

import { Context } from './context'

interface InlineQueryContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramInlineQuery
  updateId: number
}

class InlineQueryContext extends Context {
  payload: Interfaces.TelegramInlineQuery

  constructor(options: InlineQueryContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'inline_query',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Answers to inline query */
  answerInlineQuery(
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

interface InlineQueryContext extends InlineQuery { }
applyMixins(InlineQueryContext, [InlineQuery])

inspectable(InlineQueryContext, {
  serialize(query) {
    const payload = {
      id: query.id,
      from: query.from,
      location: query.location,
      query: query.query,
      offset: query.offset
    }

    return filterPayload(payload)
  }
})

export { InlineQueryContext }
