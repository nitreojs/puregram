import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** This object represents a shipping address. */
export class ShippingAddress {
  constructor(private payload: Interfaces.TelegramShippingAddress) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** ISO 3166-1 alpha-2 country code */
  get countryCode() {
    return this.payload.country_code
  }

  /** State, if applicable */
  get state() {
    return this.payload.state
  }

  /** City */
  get city() {
    return this.payload.city
  }

  /** First line for the address */
  get firstStreetLine() {
    return this.payload.street_line1
  }

  /** Second line for the address */
  get secondStreetLine() {
    return this.payload.street_line2
  }

  /** Address post code */
  get postCode() {
    return this.payload.post_code
  }
}

inspectable(ShippingAddress, {
  serialize(address) {
    return {
      countryCode: address.countryCode,
      state: address.state,
      city: address.city,
      firstStreetLine: address.firstStreetLine,
      secondStreetLine: address.secondStreetLine,
      postCode: address.postCode
    }
  }
})
