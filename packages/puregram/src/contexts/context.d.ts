import { ITelegramParams, AllowArray } from '../../typings/params';

declare class Context {
  public constructor(telegram: ITelegramParams, type: string);

  public is(types: AllowArray<string>): boolean;
}

export = Context;
