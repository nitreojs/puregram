import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** Contains information about a Web App. */
export class WebAppInfo {
  constructor(private payload: Interfaces.TelegramWebAppInfo) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** An HTTPS URL of a Web App to be opened with additional data as specified in Initializing Web Apps */
  get url() {
    return this.payload.url
  }
}

inspectable(WebAppInfo, {
  serialize(info) {
    const payload = {
      url: info.url
    }

    return payload
  }
})
