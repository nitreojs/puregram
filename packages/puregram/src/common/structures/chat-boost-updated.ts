import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'
import { Chat } from './chat'
import { ChatBoost } from './chat-boost'
import { memoizeGetters } from '../../utils/helpers'

/** This object represents a boost added to a chat or changed. */
@Inspectable()
export class ChatBoostUpdated implements Structure {
  constructor (public payload: Interfaces.TelegramChatBoostUpdated) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Chat which was boosted */
  @Inspect()
  get chat () {
    return new Chat(this.payload.chat)
  }

  /** Infomation about the chat boost */
  @Inspect()
  get boost () {
    return new ChatBoost(this.payload.boost)
  }

  toJSON (): Record<string, any> {
    return this.payload
  }
}

memoizeGetters(ChatBoostUpdated, ['chat', 'boost'])
