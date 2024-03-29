import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** Contains information about a Web App. */
@Inspectable()
export class WebAppInfo implements Structure {
  constructor (public payload: Interfaces.TelegramWebAppInfo) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** An HTTPS URL of a Web App to be opened with additional data as specified in Initializing Web Apps */
  @Inspect()
  get url () {
    return this.payload.url
  }

  toJSON () {
    return this.payload
  }
}
