import { inspectable } from 'inspectable'

import { TelegramOrderInfo } from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { ShippingAddress } from './shipping-address'

/** This object represents information about an order. */
export class OrderInfo {
  constructor(private payload: TelegramOrderInfo) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** User name */
  get name() {
    return this.payload.name
  }

  /** User's phone number */
  get phoneNumber() {
    return this.payload.phone_number
  }

  /** User email */
  get email() {
    return this.payload.email
  }

  /** User shipping address */
  get shippingAddress() {
    const { shipping_address } = this.payload

    if (!shipping_address) {
      return
    }

    return new ShippingAddress(shipping_address)
  }
}

inspectable(OrderInfo, {
  serialize(order: OrderInfo) {
    const payload = {
      name: order.name,
      phoneNumber: order.phoneNumber,
      email: order.email,
      shippingAddress: order.shippingAddress
    }

    return filterPayload(payload)
  }
})
