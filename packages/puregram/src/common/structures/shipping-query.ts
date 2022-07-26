import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { User } from './user'
import { ShippingAddress } from './shipping-address'

/** This object contains information about an incoming shipping query. */
export class ShippingQuery implements Structure {
  constructor (public payload: Interfaces.TelegramShippingQuery) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique query identifier */
  get id () {
    return this.payload.id
  }

  /** User who sent the query */
  get from () {
    return new User(this.payload.from)
  }

  /** Sender ID */
  get senderId () {
    return this.from.id
  }

  /** Bot specified invoice payload */
  get invoicePayload () {
    return this.payload.invoice_payload
  }

  /** User specified shipping address */
  get shippingAddress () {
    return new ShippingAddress(this.payload.shipping_address)
  }

  toJSON (): Interfaces.TelegramShippingQuery {
    return {
      id: this.id,
      from: this.from.toJSON(),
      invoice_payload: this.invoicePayload,
      shipping_address: this.shippingAddress.toJSON()
    }
  }
}

inspectable(ShippingQuery, {
  serialize (struct) {
    return {
      id: struct.id,
      from: struct.from,
      senderId: struct.senderId,
      invoicePayload: struct.invoicePayload,
      shippingAddress: struct.shippingAddress
    }
  }
})
