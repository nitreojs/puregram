import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { MessageEntities } from '../message-entities'

import { MessageEntity } from './message-entity'

/** This object contains information about the quoted part of a message that is replied to by the given message. */
@Inspectable()
export class TextQuote implements Structure {
  constructor (public payload: Interfaces.TelegramTextQuote) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Text of the quoted part of a message that is replied to by the given message */
  @Inspect()
  get text () {
    return this.payload.text
  }

  /** Special entities that appear in the quote. Currently, only `bold`, `italic`, `underline`, `strikethrough`, `spoiler`, and `custom_emoji` entities are kept in quotes. */
  @Inspect({ nullable: false })
  get entities () {
    const { entities } = this.payload

    if (!entities) {
      return undefined
    }

    return new MessageEntities(...entities.map(e => new MessageEntity(e)))
  }

  /** Approximate quote position in the original message in UTF-16 code units as specified by the sender */
  @Inspect()
  get position () {
    return this.payload.position
  }

  /** `true`, if the quote was chosen manually by the message sender. Otherwise, the quote was added automatically by the server. */
  @Inspect({ compute: true, nullable: false })
  isManual () {
    return this.payload.is_manual
  }

  toJSON () {
    return this.payload
  }
}
