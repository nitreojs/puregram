import { inspectable } from 'inspectable';

import { User } from './user';

import { TelegramProximityAlertTriggered } from '../../telegram-interfaces';

/**
 * This object represents the content of a service message,
 * sent whenever a user in the chat triggers a proximity alert set by another user.
 */
export class ProximityAlertTriggered {
  private payload: TelegramProximityAlertTriggered;

  constructor(payload: TelegramProximityAlertTriggered) {
    this.payload = payload;
  }

  /** User that triggered the alert */
  public get traveler(): User {
    return new User(this.payload.traveler);
  }

  /** User that set the alert */
  public get watcher(): User {
    return new User(this.payload.watcher);
  }

  /** The distance between the users */
  public get distance(): number {
    return this.payload.distance;
  }
}

inspectable(ProximityAlertTriggered, {
  serialize(alert: ProximityAlertTriggered) {
    return {
      traveler: alert.traveler,
      watcher: alert.watcher,
      distance: alert.distance
    };
  }
});
