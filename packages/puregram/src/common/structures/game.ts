import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { AnimationAttachment } from '../attachments'
import { filterPayload } from '../../utils/helpers'

import { PhotoSize } from './photo-size'
import { MessageEntity } from './message-entity'

/** This object represents a game. */
export class Game implements Structure {
  constructor (public payload: Interfaces.TelegramGame) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Title of the game */
  get title () {
    return this.payload.title
  }

  /** Description of the game */
  get description () {
    return this.payload.description
  }

  /** Photo that will be displayed in the game message in chats. */
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
  get text () {
    return this.payload.text
  }

  /**
   * Special entities that appear in text, such as usernames, URLs, bot
   * commands, etc.
   */
  get textEntities () {
    const { text_entities } = this.payload

    if (!text_entities) {
      return
    }

    return text_entities.map(entity => new MessageEntity(entity))
  }

  /**
   * Animation that will be displayed in the game message in chats.
   * Upload via BotFather
   */
  get animation (): AnimationAttachment | undefined {
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

inspectable(Game, {
  serialize (struct) {
    const payload = {
      title: struct.title,
      description: struct.description,
      photo: struct.photo,
      text: struct.text,
      textEntities: struct.textEntities,
      animation: struct.animation
    }

    return filterPayload(payload)
  }
})
