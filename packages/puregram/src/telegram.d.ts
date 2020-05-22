import API from './api';
import Updates from './updates';
import Params from '../typings/params';

import { IUser } from '../typings/interfaces';

declare class Telegram {
  public api: API;
  public updates: Updates;

  /**
   * Can be accessed only after `startPolling` method
   */
  public bot: IUser;

  constructor(params: Params.ITelegramParams);
}

export = Telegram;
