import { Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about General forum topic unhidden in the chat. Currently holds no information. */
@Inspectable()
export class GeneralForumTopicUnhidden implements Structure {
  constructor (public payload: Interfaces.TelegramGeneralForumTopicUnhidden) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  toJSON () {
    return this.payload
  }
}
