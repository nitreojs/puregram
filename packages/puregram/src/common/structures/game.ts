import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { AnimationAttachment } from '../attachments'

import { PhotoSize } from './photo-size'
import { MessageEntity } from './message-entity'
import { MessageEntities } from '../message-entities'

/** This object represents a game. */
@Inspectable()
export class Game implements Structure {
  constructor (public payload: Interfaces.TelegramGame) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Title of the game */
  @Inspect()
  get title () {
    return this.payload.title
  }

  /** Description of the game */
  @Inspect()
  get description () {
    return this.payload.description
  }

  /** Photo that will be displayed in the game message in chats. */
  @Inspect({ nullable: false })
  get photo () {
    const { photo } = this.payload

    if (!photo) {
      return
    }

    return photo.map(element => new PhotoSize(element))
  }

  /**
   * Brief description of the game or high scores included in the game message
   * Can be automatically edited to include current high scores for the game
   * when the bot calls `setGameScore`, or manually edited using
   * `editMessageText`. 0-4096 characters.
   */
  @Inspect({ nullable: false })
  get text () {
    return this.payload.text
  }

  /**
   * Special entities that appear in text, such as usernames, URLs, bot
   * commands, etc.
   */
  @Inspect({ nullable: false })
  get textEntities () {
    const { text_entities } = this.payload

    if (!text_entities) {
      return
    }

    return new MessageEntities(...text_entities.map(entity => new MessageEntity(entity)))
  }

  /**
   * Animation that will be displayed in the game message in chats.
   * Upload via BotFather
   */
  @Inspect({ nullable: false })
  get animation () {
    const { animation } = this.payload

    if (!animation) {
      return
    }

    return new AnimationAttachment(animation)
  }

  toJSON () {
    return this.payload
  }
}
