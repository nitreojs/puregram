import { inspectable } from 'inspectable'

import { Context } from './context'

import {
  filterPayload,
  applyMixins
} from '../utils/helpers'

import { InlineQuery } from '../updates/inline-query'

import {
  TelegramInlineQuery,
  TelegramInlineQueryResult,
  TelegramUpdate
} from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { AnswerInlineQueryParams } from '../generated/methods'

interface InlineQueryContextOptions {
  telegram: Telegram
  update: TelegramUpdate
  payload: TelegramInlineQuery
  updateId: number
}

class InlineQueryContext extends Context {
  payload: TelegramInlineQuery

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
    results: TelegramInlineQueryResult[],
    params?: Partial<AnswerInlineQueryParams>
  ): Promise<true> {
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
  serialize(query: InlineQueryContext) {
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
