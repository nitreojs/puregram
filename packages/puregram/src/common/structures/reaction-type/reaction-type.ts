import * as Interfaces from '../../../generated/telegram-interfaces'

import { Structure } from '../../../types/interfaces'

export class ReactionType implements Structure {
  constructor (public payload: Interfaces.TelegramReactionType) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Is this reaction type the same as the `type`? */
  is (type: Interfaces.TelegramReactionType['type']) {
    return this.payload.type === type
  }

  toJSON () {
    return this.payload
  }
}
