import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

import { ShippingAddress } from './shipping-address'

/** This object represents information about an order. */
export class OrderInfo implements Structure {
  constructor (public payload: Interfaces.TelegramOrderInfo) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** User name */
  get name () {
    return this.payload.name
  }

  /** User's phone number */
  get phoneNumber () {
    return this.payload.phone_number
  }

  /** User email */
  get email () {
    return this.payload.email
  }

  /** User shipping address */
  get shippingAddress () {
    const { shipping_address } = this.payload

    if (!shipping_address) {
      return
    }

    return new ShippingAddress(shipping_address)
  }

  toJSON (): Interfaces.TelegramOrderInfo {
    return {
      name: this.name,
      phone_number: this.phoneNumber,
      email: this.email,
      shipping_address: this.shippingAddress?.toJSON()
    }
  }
}

inspectable(OrderInfo, {
  serialize (struct) {
    const payload = {
      name: struct.name,
      phoneNumber: struct.phoneNumber,
      email: struct.email,
      shippingAddress: struct.shippingAddress
    }

    return filterPayload(payload)
  }
})
