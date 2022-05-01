import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/**
 * This object represents a service message about a video chat started in the chat.
 * Currently holds no information.
 */
export class VideoChatStarted {
  constructor(public payload: Interfaces.TelegramVideoChatStarted) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }
}

inspectable(VideoChatStarted, {
  serialize(event: VideoChatStarted) {
    return {}
  }
})
