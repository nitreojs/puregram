import Params from '../../typings/params';
import Interfaces from '../../typings/interfaces';
import Context from './context';

declare class PollAnswer extends Context {
  public constructor(telegram: Params.ITelegramParams, update: object);

  public pollId: string;

  public user?: Interfaces.IUser;

  public optionIds: Array<number>;
}

export = PollAnswer;
