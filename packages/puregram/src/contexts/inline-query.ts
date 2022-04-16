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
} from '../telegram-interfaces'

import { Telegram } from '../telegram'
import { AnswerInlineQueryParams } from '../methods'

interface InlineQueryContextOptions {
  telegram: Telegram
  update: TelegramUpdate
  payload: TelegramInlineQuery
  updateId: number
}

class InlineQueryContext extends Context {
  public payload: TelegramInlineQuery

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
  public answerInlineQuery(
    results: TelegramInlineQueryResult[],
    params?: Partial<AnswerInlineQueryParams>
  ): Promise<true> {
    return this.telegram.api.answerInlineQuery({
      ...params,
      inline_query_id: this.id,
      results
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
