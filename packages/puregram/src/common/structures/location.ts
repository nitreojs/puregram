import { inspectable } from 'inspectable';

import { TelegramLocation } from '../../interfaces';

/** This object represents a point on the map. */
export class Location {
  private payload: TelegramLocation;

  constructor(payload: TelegramLocation) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Longitude as defined by sender */
  public get longitude(): number {
    return this.payload.longitude;
  }

  /** Latitude as defined by sender */
  public get latitude(): number {
    return this.payload.latitude;
  }
}

inspectable(Location, {
  serialize(location: Location) {
    return {
      longitude: location.longitude,
      latitude: location.latitude
    };
  }
});
