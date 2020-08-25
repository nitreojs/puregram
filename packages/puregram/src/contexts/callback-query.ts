// eslint-disable-next-line max-classes-per-file
import { inspectable } from 'inspectable';

import { Context } from './context';
import { applyMixins, filterPayload, isParseable } from '../utils/helpers';
import { CallbackQuery } from '../updates/';
import { TelegramCallbackQuery } from '../interfaces';
import { Telegram } from '../telegram';
import { MessageContext } from './message';
import { AnswerCallbackQueryParams } from '../methods';

/** Called when `callback_query` event occurs */
class CallbackQueryContext extends Context {
  public payload: TelegramCallbackQuery;

  constructor(telegram: Telegram, update: TelegramCallbackQuery) {
    super(telegram, 'callback_query');

    this.payload = update;
  }

  /**
   * Message with the callback button that originated the query.
   * Note that message content and message date will not be available
   * if the message is too old
   */
  public get message(): MessageContext | undefined {
    if (this.payload.message === undefined) return undefined;

    return new MessageContext(this.telegram, this.payload.message);
  }

  /**
   * Data associated with the callback button.
   * Be aware that a bad client can send arbitrary data in this field.
   */
  public get queryPayload(): Record<string, any> | string | undefined {
    const { data } = this.payload;

    if (data === undefined) return undefined;

    if (isParseable(data)) {
      return JSON.parse(data);
    }

    return data;
  }

  /** Answers to current callback query */
  public answerCallbackQuery(
    params?: Partial<AnswerCallbackQueryParams>
  ): Promise<true> {
    return this.telegram.api.answerCallbackQuery({
      ...params,
      callback_query_id: this.id
    });
  }
}

class TempCallbackQueryContext extends CallbackQueryContext {}

interface CallbackQueryContext extends CallbackQuery { }
applyMixins(TempCallbackQueryContext, [CallbackQuery, CallbackQueryContext]);

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
    };

    return filterPayload(payload);
  }
});

export { TempCallbackQueryContext as CallbackQueryContext };
