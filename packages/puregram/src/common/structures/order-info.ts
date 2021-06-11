import { inspectable } from 'inspectable';

import { ShippingAddress } from './shipping-address';

import { TelegramOrderInfo } from '../../telegram-interfaces';
import { filterPayload } from '../../utils/helpers';

/** This object represents information about an order. */
export class OrderInfo {
  private payload: TelegramOrderInfo;

  constructor(payload: TelegramOrderInfo) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** User name */
  public get name(): string | undefined {
    return this.payload.name;
  }

  /** User's phone number */
  public get phoneNumber(): string | undefined {
    return this.payload.phone_number;
  }

  /** User email */
  public get email(): string | undefined {
    return this.payload.email;
  }

  /** User shipping address */
  public get shippingAddress(): ShippingAddress | undefined {
    const { shipping_address } = this.payload;

    if (!shipping_address) return undefined;

    return new ShippingAddress(shipping_address);
  }
}

inspectable(OrderInfo, {
  serialize(order: OrderInfo) {
    const payload = {
      name: order.name,
      phoneNumber: order.phoneNumber,
      email: order.email,
      shippingAddress: order.shippingAddress
    };

    return filterPayload(payload);
  }
});
