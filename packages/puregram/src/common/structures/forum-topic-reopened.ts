import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about an edited forum topic. */
export class ForumTopicReopened implements Structure {
  constructor (private payload: Interfaces.TelegramForumTopicReopened) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  toJSON (): Interfaces.TelegramForumTopicReopened {
    return { }
  }
}

inspectable(ForumTopicReopened, {
  serialize (struct) {
    return { }
  }
})