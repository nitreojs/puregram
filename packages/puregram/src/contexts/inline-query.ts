import { inspectable } from 'inspectable';

import { Context } from './context';

import {
  filterPayload,
  applyMixins
} from '../utils/helpers';

import { InlineQuery } from '../updates/inline-query';

import {
  TelegramInlineQuery,
  InlineQueryResultUnion
} from '../interfaces';

import { Telegram } from '../telegram';
import { AnswerInlineQueryParams } from '../methods';

class InlineQueryContext extends Context {
  public payload: TelegramInlineQuery;

  constructor(telegram: Telegram, update: TelegramInlineQuery) {
    super(telegram, 'inline_query');

    this.payload = update;
  }

  /** Answers to inline query */
  public answerInlineQuery(
    results: InlineQueryResultUnion[],
    params?: Partial<AnswerInlineQueryParams>
  ): Promise<true> {
    return this.telegram.api.answerInlineQuery({
      ...params,
      inline_query_id: this.id,
      results
    });
  }
}

interface InlineQueryContext extends InlineQuery { }
applyMixins(InlineQueryContext, [InlineQuery]);

inspectable(InlineQueryContext, {
  serialize(query: InlineQueryContext) {
    const payload = {
      id: query.id,
      from: query.from,
      location: query.location,
      query: query.query,
      offset: query.offset
    };

    return filterPayload(payload);
  }
});

export { InlineQueryContext };
