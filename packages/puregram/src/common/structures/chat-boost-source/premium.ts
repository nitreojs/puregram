import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../../generated/telegram-interfaces'

import { User } from '../user'

import { ChatBoostSource } from './chat-boost-source'

/** The boost was obtained by subscribing to Telegram Premium or by gifting a Telegram Premium subscription to another user. */
@Inspectable()
export class ChatBoostSourcePremium extends ChatBoostSource {
  constructor (public payload: Interfaces.TelegramChatBoostSourcePremium) {
    super(payload)
  }

  /** Source of the boost, always `premium` */
  @Inspect()
  get source () {
    return this.payload.source
  }

  /** User that boosted the chat */
  @Inspect()
  get user () {
    return new User(this.payload.user)
  }
}
