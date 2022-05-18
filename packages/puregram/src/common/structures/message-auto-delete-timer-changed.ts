import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** This object represents a service message about a change in auto-delete timer settings */
export class MessageAutoDeleteTimerChanged {
  constructor(public payload: Interfaces.TelegramMessageAutoDeleteTimerChanged) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** New auto-delete time for messages in the chat */
  get messageAutoDeleteTime() {
    return this.payload.message_auto_delete_time
  }
}

inspectable(MessageAutoDeleteTimerChanged, {
  serialize(struct) { // rip `holyShitThatName` =(
    return {}
  }
})
