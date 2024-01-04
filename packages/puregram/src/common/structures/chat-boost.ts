import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'
import { ChatBoostSourceGiftCode, ChatBoostSourceGiveaway, ChatBoostSourcePremium } from './chat-boost-source'
import { memoizeGetters } from '../../utils/helpers'

/** This object contains information about a chat boost. */
@Inspectable()
export class ChatBoost implements Structure {
  constructor (public payload: Interfaces.TelegramChatBoost) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique identifier of the boost */
  @Inspect()
  get id () {
    return this.payload.boost_id
  }

  /** Point in time (Unix timestamp) when the chat was boosted */
  @Inspect()
  get addDate () {
    return this.payload.add_date
  }

  /** Point in time (Unix timestamp) when the boost will automatically expire, unless the booster's Telegram Premium subscription is prolonged */
  @Inspect()
  get expirationDate () {
    return this.payload.expiration_date
  }

  /** Source of the added boost */
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

memoizeGetters(ChatBoost, ['source'])
