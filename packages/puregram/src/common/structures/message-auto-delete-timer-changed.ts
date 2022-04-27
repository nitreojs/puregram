import { inspectable } from 'inspectable'

import { TelegramMessageAutoDeleteTimerChanged } from '../../generated/telegram-interfaces'

/** This object represents a service message about a change in auto-delete timer settings */
export class MessageAutoDeleteTimerChanged {
  constructor(public payload: TelegramMessageAutoDeleteTimerChanged) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** New auto-delete time for messages in the chat */
  get messageAutoDeleteTime() {
    return this.payload.message_auto_delete_time
  }
}

inspectable(MessageAutoDeleteTimerChanged, {
  serialize(holyShitThatName: MessageAutoDeleteTimerChanged) {
    return {}
  }
})
