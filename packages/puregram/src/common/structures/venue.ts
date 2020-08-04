import { inspectable } from 'inspectable';

import { TelegramVenue } from '../../interfaces';
import { Location } from './location';
import { filterPayload } from '../../utils/helpers';

/** This object represents a venue. */
export class Venue {
  private payload: TelegramVenue;

  constructor(payload: TelegramVenue) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Venue location */
  public get location(): Location | undefined {
    const { location } = this.payload;

    if (!location) return undefined;

    return new Location(location);
  }

  /** Name of the venue */
  public get title(): string {
    return this.payload.title;
  }

  /** Address of the venue */
  public get address(): string {
    return this.payload.address;
  }

  /** Foursquare identifier of the venue */
  public get foursquareId(): string | undefined {
    return this.payload.foursquare_id;
  }

  /** Foursquare type of the venue */
  public get foursquareType(): string | undefined {
    return this.payload.foursquare_type;
  }
}

inspectable(Venue, {
  serialize(venue: Venue) {
    const payload = {
      location: venue.location,
      title: venue.title,
      address: venue.address,
      foursquareId: venue.foursquareId,
      foursquareType: venue.foursquareType
    };

    return filterPayload(payload);
  }
});
