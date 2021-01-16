import { inspectable } from 'inspectable';

import { Location } from './location';

import { TelegramChatLocation } from '../../interfaces';

export class ChatLocation {
  private payload: TelegramChatLocation;

  constructor(payload: TelegramChatLocation) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** The location to which the supergroup is connected. Can't be a live location. */
  public get location(): Location {
    return new Location(this.payload.location);
  }

  /** Location address; `1-64` characters, as defined by the chat owner */
  public get address(): string {
    return this.payload.address;
  }
}

inspectable(ChatLocation, {
  serialize(chatLocation: ChatLocation) {
    return {
      location: chatLocation.location,
      address: chatLocation.address
    };
  }
});
