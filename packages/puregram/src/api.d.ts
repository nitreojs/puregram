import Params from '../typings/params';
import Interfaces from '../typings/interfaces';
import Responses from '../typings/responses';
import Telegram from './telegram';

// STRUCTURES
import User from './structures/user';

declare class API {
  constructor(telegram: Telegram);

  call(method: string, params: object): Promise<object>;

  /**
   * A simple method for testing your bot's auth token.
   * 
   * Returns basic information about the bot in form of a `User` object.
   */
  getMe(): Promise<User>;

  /**
   * Use this method to receive incoming updates using long polling.
   * 
   * An Array of `Update` objects is returned.
   */
  getUpdates(params?: Params.IGetUpdatesParams): Promise<Array<Interfaces.IUpdate>>;

  /**
   * Use this method to send text messages.
   * 
   * On success, the sent `Message` is returned.
   */
  sendMessage(params?: Params.ISendMessageParams): Promise<Interfaces.IMessage>;

  /**
   * Use this method to forward messages of any kind.
   * 
   * On success, the sent `Message` is returned.
   */
  forwardMessage(params?: Params.IForwardMessageParams): Promise<Interfaces.IMessage>;
}

export = API;
