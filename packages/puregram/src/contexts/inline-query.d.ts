import Params from "../../typings/params";
import Interfaces from "../../typings/interfaces";
import MessageContext from './message';
import Context from './context';

type MessageOrTrue = MessageContext | true;

declare class InlineQuery extends Context {
  public constructor(telegram: Params.ITelegramParams, update: object);

  public id: string;

  public from?: Interfaces.IUser;

  public senderId?: number;

  public location?: Interfaces.ILocation;

  public query: string;

  public offset: string;

  public answerInlineQuery(
    results: Array<Interfaces.InlineQueryResult>,
    params: Params.IAnswerInlineQueryParams
  ): Promise<true>;
}

export = InlineQuery;
