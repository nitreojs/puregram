import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../../generated'

import { User } from '../user'

import { MessageOrigin } from './message-origin'
import { memoizeGetters } from '../../../utils/helpers'

/** The message was originally sent by a known user. */
@Inspectable()
export class MessageOriginUser extends MessageOrigin {
  constructor (public payload: Interfaces.TelegramMessageOriginUser) {
    super(payload)
  }

  /** Type of the message origin, always `user` */
  @Inspect()
  get type () {
    return this.payload.type
  }

  /** Date the message was sent originally in Unix time */
  @Inspect()
  get date () {
    return this.payload.date
  }

  /** User that sent the message originally */
  @Inspect()
  get senderUser () {
    return new User(this.payload.sender_user)
  }
}

memoizeGetters(MessageOriginUser, ['senderUser'])
