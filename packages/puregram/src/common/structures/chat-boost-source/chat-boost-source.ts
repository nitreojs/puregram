import * as Interfaces from '../../../generated/telegram-interfaces'

import { Structure } from '../../../types/interfaces'

import type { ChatBoostSourceGiftCode } from './gift-code'
import type { ChatBoostSourceGiveaway } from './giveaway'
import type { ChatBoostSourcePremium } from './premium'

interface ChatBoostSourceMapping {
  premium: ChatBoostSourcePremium
  gift_code: ChatBoostSourceGiftCode
  giveaway: ChatBoostSourceGiveaway
}

export class ChatBoostSource implements Structure {
  constructor (public payload: Interfaces.TelegramChatBoostSource) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Is this chat boost source a certain one? */
  is <T extends Interfaces.TelegramChatBoostSource['source']> (source: T): this is ChatBoostSourceMapping[T] {
    return this.payload.source === source
  }

  toJSON (): Record<string, any> {
    return this.payload
  }
}
