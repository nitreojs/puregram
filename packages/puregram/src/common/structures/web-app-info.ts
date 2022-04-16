import { inspectable } from 'inspectable'

import { TelegramWebAppInfo } from '../../telegram-interfaces'

/** Contains information about a Web App. */
export class WebAppInfo {
  private payload: TelegramWebAppInfo

  constructor(payload: TelegramWebAppInfo) {
    this.payload = payload
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** An HTTPS URL of a Web App to be opened with additional data as specified in Initializing Web Apps */
  public get url(): string {
    return this.payload.url
  }
}

inspectable(WebAppInfo, {
  serialize(info: WebAppInfo) {
    const payload = {
      url: info.url
    }

    return payload
  }
})
