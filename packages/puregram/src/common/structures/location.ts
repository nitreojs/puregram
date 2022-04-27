import { inspectable } from 'inspectable'

import { TelegramLocation } from '../../generated/telegram-interfaces'

/** This object represents a point on the map. */
export class Location {
  constructor(private payload: TelegramLocation) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Longitude as defined by sender */
  get longitude() {
    return this.payload.longitude
  }

  /** Latitude as defined by sender */
  get latitude() {
    return this.payload.latitude
  }

  /** The radius of uncertainty for the location, measured in meters; `0-1500` */
  get horizontalAccuracy() {
    return this.payload.horizontal_accuracy
  }

  /**
   * Time relative to the message sending date,
   * during which the location can be updated, in seconds.
   * For active live locations only.
   */
  get livePeriod() {
    return this.payload.live_period
  }

  /**
   * The direction in which user is moving, in degrees; `1-360`.
   * For active live locations only.
   */
  get heading() {
    return this.payload.heading
  }

  /**
   * Maximum distance for proximity alerts about approaching another chat member, in meters.
   * For sent live locations only.
   */
  get proximityAlertRadius() {
    return this.payload.proximity_alert_radius
  }
}

inspectable(Location, {
  serialize(location: Location) {
    return {
      longitude: location.longitude,
      latitude: location.latitude,
      horizontalAccuracy: location.horizontalAccuracy,
      livePeriod: location.livePeriod,
      heading: location.heading,
      proximityAlertRadius: location.proximityAlertRadius
    }
  }
})
