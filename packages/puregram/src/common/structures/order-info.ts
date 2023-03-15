import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { ShippingAddress } from './shipping-address'

/** This object represents information about an order. */
@Inspectable()
export class OrderInfo implements Structure {
  constructor (public payload: Interfaces.TelegramOrderInfo) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** User name */
  @Inspect({ nullable: false })
  get name () {
    return this.payload.name
  }

  /** User's phone number */
  @Inspect({ nullable: false })
  get phoneNumber () {
    return this.payload.phone_number
  }

  /** User email */
  @Inspect({ nullable: false })
  get email () {
    return this.payload.email
  }

  /** User shipping address */
  @Inspect({ nullable: false })
  get shippingAddress () {
    const { shipping_address } = this.payload

    if (!shipping_address) {
      return
    }

    return new ShippingAddress(shipping_address)
  }

  toJSON () {
    return this.payload
  }
}
