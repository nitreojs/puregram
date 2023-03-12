import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/**
 * This object represents a service message about a video chat started in the chat.
 * Currently holds no information.
 */
export class VideoChatStarted implements Structure {
  constructor (public payload: Interfaces.TelegramVideoChatStarted) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  toJSON () {
    return this.payload
  }
}

inspectable(VideoChatStarted, {
  serialize (struct) {
    return {}
  }
})
