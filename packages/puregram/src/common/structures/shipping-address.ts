import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a shipping address. */
export class ShippingAddress implements Structure {
  constructor (public payload: Interfaces.TelegramShippingAddress) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** ISO 3166-1 alpha-2 country code */
  get countryCode () {
    return this.payload.country_code
  }

  /** State, if applicable */
  get state () {
    return this.payload.state
  }

  /** City */
  get city () {
    return this.payload.city
  }

  /** First line for the address */
  get firstStreetLine () {
    return this.payload.street_line1
  }

  /** Second line for the address */
  get secondStreetLine () {
    return this.payload.street_line2
  }

  /** Address post code */
  get postCode () {
    return this.payload.post_code
  }

  toJSON (): Interfaces.TelegramShippingAddress {
    return {
      country_code: this.countryCode,
      state: this.state,
      city: this.city,
      street_line1: this.firstStreetLine,
      street_line2: this.secondStreetLine,
      post_code: this.postCode
    }
  }
}

inspectable(ShippingAddress, {
  serialize (struct) {
    return {
      countryCode: struct.countryCode,
      state: struct.state,
      city: struct.city,
      firstStreetLine: struct.firstStreetLine,
      secondStreetLine: struct.secondStreetLine,
      postCode: struct.postCode
    }
  }
})
