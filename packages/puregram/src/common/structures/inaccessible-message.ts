import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import type { Structure } from '../../types/interfaces'
import { Chat } from './chat'

@Inspectable()
export class InaccessibleMessage implements Structure {
  constructor (public payload: Interfaces.TelegramInaccessibleMessage) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique message identifier inside the chat */
  @Inspect()
  get id () {
    return this.payload.message_id
  }

  /** Chat the message belonged to */
  @Inspect()
  get chat () {
    return new Chat(this.payload.chat)
  }

  /** Always `0`. The field can be used to differentiate regular and inaccessible messages. */
  @Inspect()
  get date () {
    return this.payload.date
  }

  toJSON (): Record<string, any> {
    return this.payload
  }
}
