import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about a user allowing a bot added to the attachment menu to write messages. Currently holds no information. */
export class WriteAccessAllowed implements Structure {
  constructor (public payload: Interfaces.TelegramWriteAccessAllowed) { }

  toJSON () {
    return this.payload
  }
}

inspectable(WriteAccessAllowed, {
  serialize (struct) {
    return {}
  }
})
