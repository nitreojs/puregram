import Params from '../../typings/params';
import Interfaces from '../../typings/interfaces';
import Context from './context';

declare class ShippingQuery extends Context {
  public constructor(telegram: Params.ITelegramParams, update: object);

  public id: string;

  public from: Interfaces.IUser;

  public invoicePayload: string;

  public shippingAddress: Interfaces.IShippingAddress;
}

export = ShippingQuery;
