import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about a forum topic closed in the chat. Currently holds no information. */
export class ForumTopicClosed implements Structure {
  constructor (private payload: Interfaces.TelegramForumTopicClosed) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  toJSON (): Interfaces.TelegramForumTopicClosed {
    return { }
  }
}

inspectable(ForumTopicClosed, {
  serialize (struct) {
    return { }
  }
})