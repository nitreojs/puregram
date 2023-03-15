import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a shipping address. */
@Inspectable()
export class ShippingAddress implements Structure {
  constructor (public payload: Interfaces.TelegramShippingAddress) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** ISO 3166-1 alpha-2 country code */
  @Inspect()
  get countryCode () {
    return this.payload.country_code
  }

  /** State, if applicable */
  @Inspect()
  get state () {
    return this.payload.state
  }

  /** City */
  @Inspect()
  get city () {
    return this.payload.city
  }

  /** First line for the address */
  @Inspect()
  get firstStreetLine () {
    return this.payload.street_line1
  }

  /** Second line for the address */
  @Inspect()
  get secondStreetLine () {
    return this.payload.street_line2
  }

  /** Address post code */
  @Inspect()
  get postCode () {
    return this.payload.post_code
  }

  toJSON () {
    return this.payload
  }
}
