import { inspectable } from 'inspectable'

import { TelegramVenue } from '../../telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Location } from './location'

/** This object represents a venue. */
export class Venue {
  constructor(private payload: TelegramVenue) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Venue location */
  get location(): Location | undefined {
    const { location } = this.payload

    if (!location) {
      return
    }

    return new Location(location)
  }

  /** Name of the venue */
  get title(): string {
    return this.payload.title
  }

  /** Address of the venue */
  get address(): string {
    return this.payload.address
  }

  /** Foursquare identifier of the venue */
  get foursquareId(): string | undefined {
    return this.payload.foursquare_id
  }

  /** Foursquare type of the venue */
  get foursquareType(): string | undefined {
    return this.payload.foursquare_type
  }

  /** Google Places identifier of the venue */
  get googlePlaceId(): string | undefined {
    return this.payload.google_place_id
  }

  /**
   * Google Places type of the venue.
   * (See [supported types](https://developers.google.com/places/web-service/supported_types).)
   */
  get googlePlaceType(): string | undefined {
    return this.payload.google_place_type
  }
}

inspectable(Venue, {
  serialize(venue: Venue) {
    const payload = {
      location: venue.location,
      title: venue.title,
      address: venue.address,
      foursquareId: venue.foursquareId,
      foursquareType: venue.foursquareType,
      googlePlaceId: venue.googlePlaceId,
      googlePlaceType: venue.googlePlaceType
    }

    return filterPayload(payload)
  }
})
