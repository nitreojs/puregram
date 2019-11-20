import API from './api';
import Updates from './updates';
import { ITelegramParams } from '../typings/params';

declare class Telegram {
  public api: API;
  public updates: Updates;

  constructor(params: ITelegramParams);
}

export = Telegram;
