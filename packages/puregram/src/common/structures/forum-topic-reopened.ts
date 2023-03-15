import { Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about an edited forum topic. */
@Inspectable()
export class ForumTopicReopened implements Structure {
  constructor (public payload: Interfaces.TelegramForumTopicReopened) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  toJSON () {
    return this.payload
  }
}
