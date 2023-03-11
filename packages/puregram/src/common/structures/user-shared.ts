import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object contains information about the user whose identifier was shared with the bot using a `KeyboardButtonRequestUser` button. */
export class UserShared implements Structure {
  constructor (private payload: Interfaces.TelegramUserShared) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Identifier of the request */
  get requestId () {
    return this.payload.request_id
  }

  /** Identifier of the shared user. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier. The bot may not have access to the user and could be unable to use this identifier, unless the user is already known to the bot by some other means. */
  get userId () {
    return this.payload.user_id
  }

  toJSON(): Interfaces.TelegramUserShared {
    return {
      request_id: this.requestId,
      user_id: this.userId
    }
  }
}

inspectable(UserShared, {
  serialize (struct) {
    return {
      requestId: struct.requestId,
      userId: struct.userId
    }
  }
})
