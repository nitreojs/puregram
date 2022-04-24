import { inspectable } from 'inspectable'

import { TelegramShippingQuery } from '../telegram-interfaces'
import { User } from '../common/structures/user'
import { ShippingAddress } from '../common/structures/shipping-address'

/** This object contains information about an incoming shipping query. */
export class ShippingQuery {
  constructor(public payload: TelegramShippingQuery) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Unique query identifier */
  get id() {
    return this.payload.id
  }

  /** User who sent the query */
  get from() {
    return new User(this.payload.from)
  }

  /** Sender ID */
  get senderId() {
    return this.from.id
  }

  /** Bot specified invoice payload */
  get invoicePayload() {
    return this.payload.invoice_payload
  }

  /** User specified shipping address */
  get shippingAddress() {
    return new ShippingAddress(this.payload.shipping_address)
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
    }
  }
})
