import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

import { Location } from './location'

/** This object represents a venue. */
export class Venue implements Structure {
  constructor (public payload: Interfaces.TelegramVenue) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Venue location */
  get location () {
    return new Location(this.payload.location)
  }

  /** Name of the venue */
  get title () {
    return this.payload.title
  }

  /** Address of the venue */
  get address () {
    return this.payload.address
  }

  /** Foursquare identifier of the venue */
  get foursquareId () {
    return this.payload.foursquare_id
  }

  /** Foursquare type of the venue */
  get foursquareType () {
    return this.payload.foursquare_type
  }

  /** Google Places identifier of the venue */
  get googlePlaceId () {
    return this.payload.google_place_id
  }

  /**
   * Google Places type of the venue.
   * (See [supported types](https://developers.google.com/places/web-service/supported_types).)
   */
  get googlePlaceType () {
    return this.payload.google_place_type
  }

  toJSON (): Interfaces.TelegramVenue {
    return {
      location: this.location.toJSON(),
      title: this.title,
      address: this.address,
      foursquare_id: this.foursquareId,
      foursquare_type: this.foursquareType,
      google_place_id: this.googlePlaceId,
      google_place_type: this.googlePlaceType
    }
  }
}

inspectable(Venue, {
  serialize (struct) {
    const payload = {
      location: struct.location,
      title: struct.title,
      address: struct.address,
      foursquareId: struct.foursquareId,
      foursquareType: struct.foursquareType,
      googlePlaceId: struct.googlePlaceId,
      googlePlaceType: struct.googlePlaceType
    }

    return filterPayload(payload)
  }
})
