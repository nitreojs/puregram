import API from './api';
import Updates from './updates';
import Params from '../typings/params';

declare class Telegram {
  public api: API;
  public updates: Updates;

  constructor(params: Params.ITelegramParams);
}

export = Telegram;
