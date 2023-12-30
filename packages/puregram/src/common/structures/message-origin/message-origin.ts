import * as Interfaces from '../../../generated'

import type { MessageOriginUser } from './user'
import type { MessageOriginChat } from './chat'
import type { MessageOriginChannel } from './channel'
import type { MessageOriginHiddenUser } from './hidden-user'

import { Structure } from '../../../types/interfaces'

interface MessageOriginMapping {
  user: MessageOriginUser
  chat: MessageOriginChat
  channel: MessageOriginChannel
  hidden_user: MessageOriginHiddenUser
}

export class MessageOrigin implements Structure {
  constructor (public payload: Interfaces.TelegramMessageOrigin) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Is this message origin a certain one?  */
  is <T extends Interfaces.TelegramMessageOrigin['type']> (type: T): this is MessageOriginMapping[T] {
    return this.payload.type === type
  }

  toJSON () {
    return this.payload
  }
}
