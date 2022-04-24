import { inspectable } from 'inspectable'

import { TelegramProximityAlertTriggered } from '../../telegram-interfaces'

import { User } from './user'

/**
 * This object represents the content of a service message,
 * sent whenever a user in the chat triggers a proximity alert set by another user.
 */
export class ProximityAlertTriggered {
  constructor(private payload: TelegramProximityAlertTriggered) { }

  /** User that triggered the alert */
  get traveler(): User {
    return new User(this.payload.traveler)
  }

  /** User that set the alert */
  get watcher(): User {
    return new User(this.payload.watcher)
  }

  /** The distance between the users */
  get distance(): number {
    return this.payload.distance
  }
}

inspectable(ProximityAlertTriggered, {
  serialize(alert: ProximityAlertTriggered) {
    return {
      traveler: alert.traveler,
      watcher: alert.watcher,
      distance: alert.distance
    }
  }
})
