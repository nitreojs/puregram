import Params from '../../typings/params';
import Interfaces from '../../typings/interfaces';
import Context from './context';
import Types from '../../typings/types';

declare class Poll extends Context {
  public constructor(telegram: Params.ITelegramParams, update: object);

  public id: string;

  public question: string;

  public options: Array<Interfaces.IPollOption>;

  public totalVoterCount: number;

  public isClosed: boolean;

  public isAnonymous: boolean;

  public type: Types.PollTypes;

  public allowsMultipleAnswers: boolean;

  public correctOptionId?: number;

  public explanation?: string;

  public explanationEntities?: Array<Interfaces.IMessageEntity>;

  public openPeriod?: number;

  public closePeriod?: number;
}

export = Poll;
