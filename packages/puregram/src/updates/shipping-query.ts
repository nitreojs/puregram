import { inspectable } from 'inspectable';

import { TelegramShippingQuery } from '../interfaces';
import { User } from '../common/structures/user';
import { ShippingAddress } from '../common/structures/shipping-address';

/** This object contains information about an incoming shipping query. */
export class ShippingQuery {
  public payload: TelegramShippingQuery;

  constructor(payload: TelegramShippingQuery) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Unique query identifier */
  public get id(): string {
    return this.payload.id;
  }

  /** User who sent the query */
  public get from(): User {
    return new User(this.payload.from);
  }

  /** Sender ID */
  public get senderId(): number {
    return this.from.id;
  }

  /** Bot specified invoice payload */
  public get invoicePayload(): string {
    return this.payload.invoice_payload;
  }

  /** User specified shipping address */
  public get shippingAddress(): ShippingAddress {
    return new ShippingAddress(this.payload.shipping_address);
  }
}

inspectable(ShippingQuery, {
  serialize(query: ShippingQuery) {
    return {
      id: query.id,
      from: query.from,
      senderId: query.senderId,
      invoicePayload: query.invoicePayload,
      shippingAddress: query.shippingAddress
    };
  }
});
