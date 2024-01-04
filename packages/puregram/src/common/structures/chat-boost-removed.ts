import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'
import { Chat } from './chat'
import { ChatBoostSourceGiftCode, ChatBoostSourceGiveaway, ChatBoostSourcePremium } from './chat-boost-source'
import { memoizeGetters } from '../../utils/helpers'

/** This object represents a boost added to a chat or changed. */
@Inspectable()
export class ChatBoostRemoved implements Structure {
  constructor (public payload: Interfaces.TelegramChatBoostRemoved) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Chat which was boosted */
  @Inspect()
  get chat () {
    return new Chat(this.payload.chat)
  }

  /** Unique identifier of the boost */
  @Inspect()
  get id () {
    return this.payload.boost_id
  }

  /** Point in time (Unix timestamp) when the boost was removed */
  @Inspect()
  get removeDate () {
    return this.payload.remove_date
  }

  /** Source of the removed boost */
  @Inspect()
  get source () {
    if (this.payload.source.source === 'premium') {
      return new ChatBoostSourcePremium(this.payload.source)
    }

    if (this.payload.source.source === 'gift_code') {
      return new ChatBoostSourceGiftCode(this.payload.source)
    }

    if (this.payload.source.source === 'giveaway') {
      return new ChatBoostSourceGiveaway(this.payload.source)
    }

    throw new TypeError('unknown chat boost source')
  }

  toJSON (): Record<string, any> {
    return this.payload
  }
}

memoizeGetters(ChatBoostRemoved, ['chat', 'source'])
