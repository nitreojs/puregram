import { inspectable } from 'inspectable';

import { TelegramShippingAddress } from '../../telegram-interfaces';

/** This object represents a shipping address. */
export class ShippingAddress {
  private payload: TelegramShippingAddress;

  constructor(payload: TelegramShippingAddress) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** ISO 3166-1 alpha-2 country code */
  public get countryCode(): string {
    return this.payload.country_code;
  }

  /** State, if applicable */
  public get state(): string {
    return this.payload.state;
  }

  /** City */
  public get city(): string {
    return this.payload.city;
  }

  /** First line for the address */
  public get firstStreetLine(): string {
    return this.payload.street_line1;
  }

  /** Second line for the address */
  public get secondStreetLine(): string {
    return this.payload.street_line2;
  }

  /** Address post code */
  public get postCode(): string {
    return this.payload.post_code;
  }
}

inspectable(ShippingAddress, {
  serialize(address: ShippingAddress) {
    return {
      countryCode: address.countryCode,
      state: address.state,
      city: address.city,
      firstStreetLine: address.firstStreetLine,
      secondStreetLine: address.secondStreetLine,
      postCode: address.postCode
    };
  }
});
