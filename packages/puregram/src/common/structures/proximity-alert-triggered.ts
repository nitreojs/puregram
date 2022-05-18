import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { User } from './user'

/**
 * This object represents the content of a service message,
 * sent whenever a user in the chat triggers a proximity alert set by another user.
 */
export class ProximityAlertTriggered {
  constructor(private payload: Interfaces.TelegramProximityAlertTriggered) { }

  /** User that triggered the alert */
  get traveler() {
    return new User(this.payload.traveler)
  }

  /** User that set the alert */
  get watcher() {
    return new User(this.payload.watcher)
  }

  /** The distance between the users */
  get distance() {
    return this.payload.distance
  }
}

inspectable(ProximityAlertTriggered, {
  serialize(struct) {
    return {
      traveler: struct.traveler,
      watcher: struct.watcher,
      distance: struct.distance
    }
  }
})
