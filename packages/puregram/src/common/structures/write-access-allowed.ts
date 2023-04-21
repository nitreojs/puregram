import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about a user allowing a bot added to the attachment menu to write messages. Currently holds no information. */
@Inspectable()
export class WriteAccessAllowed implements Structure {
  constructor (public payload: Interfaces.TelegramWriteAccessAllowed) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Name of the Web App which was launched from a link */
  @Inspect({ nullable: false })
  get webAppName () {
    return this.payload.web_app_name
  }

  toJSON () {
    return this.payload
  }
}
