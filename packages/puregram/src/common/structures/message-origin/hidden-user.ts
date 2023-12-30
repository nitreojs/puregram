import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../../generated'

import { MessageOrigin } from './message-origin'

/** The message was originally sent by an unknown user. */
@Inspectable()
export class MessageOriginHiddenUser extends MessageOrigin {
  constructor (public payload: Interfaces.TelegramMessageOriginHiddenUser) {
    super(payload)
  }

  /** Type of the message origin, always `hidden_user` */
  @Inspect()
  get type () {
    return this.payload.type
  }

  /** Date the message was sent originally in Unix time */
  @Inspect()
  get date () {
    return this.payload.date
  }

  /** Name of the user that sent the message originally */
  @Inspect()
  get senderUserName () {
    return this.payload.sender_user_name
  }
}
