import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { User } from './user'
import { memoizeGetters } from '../../utils/helpers'

/**
 * This object represents the content of a service message,
 * sent whenever a user in the chat triggers a proximity alert set by another user.
 */
@Inspectable()
export class ProximityAlertTriggered implements Structure {
  constructor (public payload: Interfaces.TelegramProximityAlertTriggered) { }

  /** User that triggered the alert */
  @Inspect()
  get traveler () {
    return new User(this.payload.traveler)
  }

  /** User that set the alert */
  @Inspect()
  get watcher () {
    return new User(this.payload.watcher)
  }

  /** The distance between the users */
  @Inspect()
  get distance () {
    return this.payload.distance
  }

  toJSON () {
    return this.payload
  }
}

memoizeGetters(ProximityAlertTriggered, ['traveler', 'watcher'])
