import Params from '../../typings/params';
import Interfaces from '../../typings/interfaces';
import Context from './context';

declare class PreCheckoutQuery extends Context {
  public constructor(telegram: Params.ITelegramParams, update: object);

  public id: string;

  public from: Interfaces.IUser;

  public senderId: number;

  public currency: string;

  public totalAmount: number;

  public invoicePayload: string;

  public shippingOptionId?: string;

  public orderInfo?: Interfaces.IOrderInfo;
}

export = PreCheckoutQuery;
