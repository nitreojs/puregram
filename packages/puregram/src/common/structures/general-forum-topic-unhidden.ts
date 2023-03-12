import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about General forum topic hidden in the chat. Currently holds no information. */
export class GeneralForumTopicUnhidden implements Structure {
  constructor (public payload: Interfaces.TelegramGeneralForumTopicUnhidden) { }

  toJSON () {
    return this.payload
  }
}

inspectable(GeneralForumTopicUnhidden, {
  serialize (struct) {
    return { }
  }
})
