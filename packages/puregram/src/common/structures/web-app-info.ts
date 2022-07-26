import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** Contains information about a Web App. */
export class WebAppInfo implements Structure {
  constructor (private payload: Interfaces.TelegramWebAppInfo) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** An HTTPS URL of a Web App to be opened with additional data as specified in Initializing Web Apps */
  get url () {
    return this.payload.url
  }

  toJSON (): Interfaces.TelegramWebAppInfo {
    return {
      url: this.url
    }
  }
}

inspectable(WebAppInfo, {
  serialize (struct) {
    return {
      url: struct.url
    }
  }
})
