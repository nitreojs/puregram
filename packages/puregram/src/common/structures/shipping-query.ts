import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { User } from './user'
import { ShippingAddress } from './shipping-address'
import { memoizeGetters } from '../../utils/helpers'

/** This object contains information about an incoming shipping query. */
@Inspectable()
export class ShippingQuery implements Structure {
  constructor (public payload: Interfaces.TelegramShippingQuery) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique query identifier */
  @Inspect()
  get id () {
    return this.payload.id
  }

  /** User who sent the query */
  @Inspect()
  get from () {
    return new User(this.payload.from)
  }

  /** Sender ID */
  @Inspect()
  get senderId () {
    return this.from.id
  }

  /** Bot specified invoice payload */
  @Inspect()
  get invoicePayload () {
    return this.payload.invoice_payload
  }

  /** User specified shipping address */
  @Inspect()
  get shippingAddress () {
    return new ShippingAddress(this.payload.shipping_address)
  }

  toJSON () {
    return this.payload
  }
}

memoizeGetters(ShippingQuery, ['from', 'shippingAddress'])
