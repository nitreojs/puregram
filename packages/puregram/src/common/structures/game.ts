import { inspectable } from 'inspectable'

import {
  TelegramGame,
  TelegramPhotoSize,
  TelegramMessageEntity
} from '../../generated/telegram-interfaces'

import { AnimationAttachment } from '../attachments'
import { filterPayload } from '../../utils/helpers'

import { PhotoSize } from './photo-size'
import { MessageEntity } from './message-entity'

/** This object represents a game. */
export class Game {
  constructor(private payload: TelegramGame) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Title of the game */
  get title() {
    return this.payload.title
  }

  /** Description of the game */
  get description() {
    return this.payload.description
  }

  /** Photo that will be displayed in the game message in chats. */
  get photo() {
    const { photo } = this.payload

    if (!photo) {
      return []
    }

    return photo.map(
      (photoElement: TelegramPhotoSize) => new PhotoSize(photoElement)
    )
  }

  /**
   * Brief description of the game or high scores included in the game message
   * Can be automatically edited to include current high scores for the game
   * when the bot calls `setGameScore`, or manually edited using
   * `editMessageText`. 0-4096 characters.
   */
  get text() {
    return this.payload.text
  }

  /**
   * Special entities that appear in text, such as usernames, URLs, bot
   * commands, etc.
   */
  get textEntities() {
    const { text_entities } = this.payload

    if (!text_entities) {
      return []
    }

    return text_entities.map(
      (entity: TelegramMessageEntity) => new MessageEntity(entity)
    )
  }

  /**
   * Animation that will be displayed in the game message in chats.
   * Upload via BotFather
   */
  animation(): AnimationAttachment | undefined {
    const { animation } = this.payload

    if (!animation) {
      return
    }

    return new AnimationAttachment(animation)
  }
}

inspectable(Game, {
  serialize(game: Game) {
    const payload = {
      title: game.title,
      description: game.description,
      photo: game.photo,
      text: game.text,
      textEntities: game.textEntities,
      animation: game.animation
    }

    return filterPayload(payload)
  }
})
