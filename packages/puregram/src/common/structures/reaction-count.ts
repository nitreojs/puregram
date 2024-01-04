import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'
import { ReactionTypeCustomEmoji, ReactionTypeEmoji } from './reaction-type'
import { memoizeGetters } from '../../utils/helpers'

/** Represents a reaction added to a message along with the number of times it was added. */
@Inspectable()
export class ReactionCount implements Structure {
  constructor (public payload: Interfaces.TelegramReactionCount) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Type of the reaction */
  @Inspect()
  get type () {
    if (this.payload.type.type === 'emoji') {
      return new ReactionTypeEmoji(this.payload.type)
    }

    if (this.payload.type.type === 'custom_emoji') {
      return new ReactionTypeCustomEmoji(this.payload.type)
    }

    throw new TypeError('unknown reaction type')
  }

  /** Number of times the reaction was added */
  @Inspect()
  get totalCount () {
    return this.payload.total_count
  }

  toJSON () {
    return this.payload
  }
}

memoizeGetters(ReactionCount, ['type'])
