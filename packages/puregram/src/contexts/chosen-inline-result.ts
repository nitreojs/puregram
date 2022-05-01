import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import * as Methods from '../generated/methods'
import { BotCommand } from '../common/structures'

import { Optional } from '../types/types'
import { Poll, ChosenInlineResult } from '../updates/'
import { Telegram } from '../telegram'
import { MediaInput } from '../media-source'
import { filterPayload, applyMixins } from '../utils/helpers'

import { Context } from './context'
import { MessageContext } from './message'

interface ChosenInlineResultContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramChosenInlineResult
  updateId: number
}

/**
 * The result of an inline query that was chosen by
 * a user and sent to their chat partner
 */
class ChosenInlineResultContext extends Context {
  payload: Interfaces.TelegramChosenInlineResult

  constructor(options: ChosenInlineResultContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'chosen_inline_result',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Sends message to current chat */
  async send(
    text: string,
    params?: Optional<Methods.SendMessageParams, 'chat_id' | 'text'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendMessage({
      chat_id: this.senderId,
      text,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends photo to current chat */
  async sendPhoto(
    photo: MediaInput,
    params?: Optional<Methods.SendPhotoParams, 'chat_id' | 'photo'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendPhoto({
      chat_id: this.senderId,
      photo,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends document to current chat */
  async sendDocument(
    document: MediaInput,
    params?: Optional<Methods.SendDocumentParams, 'chat_id' | 'document'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendDocument({
      chat_id: this.senderId,
      document,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends audio to current chat */
  async sendAudio(
    audio: MediaInput,
    params?: Optional<Methods.SendAudioParams, 'chat_id' | 'audio'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendAudio({
      chat_id: this.senderId,
      audio,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends video to current chat */
  async sendVideo(
    video: MediaInput,
    params?: Optional<Methods.SendVideoParams, 'chat_id' | 'video'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVideo({
      chat_id: this.senderId,
      video,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends animation to current chat */
  async sendAnimation(
    animation: MediaInput,
    params?: Optional<Methods.SendAnimationParams, 'chat_id' | 'animation'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendAnimation({
      chat_id: this.senderId,
      animation,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends video note to current chat */
  async sendVideoNote(
    videoNote: MediaInput,
    params?: Optional<Methods.SendVideoNoteParams, 'chat_id' | 'video_note'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVideoNote({
      chat_id: this.senderId,
      video_note: videoNote,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends voice to current chat */
  async sendVoice(
    voice: MediaInput,
    params?: Optional<Methods.SendVoiceParams, 'chat_id' | 'voice'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVoice({
      chat_id: this.senderId,
      voice,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends media group to current chat */
  async sendMediaGroup(
    mediaGroup: Methods.SendMediaGroupParams['media'],
    params?: Partial<Methods.SendMediaGroupParams>
  ): Promise<MessageContext[]> {
    const response = await this.telegram.api.sendMediaGroup({
      chat_id: this.senderId,
      media: mediaGroup,
      ...params
    })

    return response.map(
      (message: Interfaces.TelegramMessage) => new MessageContext({
        telegram: this.telegram,
        payload: message
      })
    )
  }

  /** Sends location to current chat */
  async sendLocation(
    latitude: number,
    longitude: number,
    params?: Optional<Methods.SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendLocation({
      ...params,
      chat_id: this.senderId,
      latitude,
      longitude
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends venue to current chat */
  async sendVenue(
    params: Optional<Methods.SendVenueParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVenue({
      chat_id: this.senderId,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends contact to current chat */
  async sendContact(
    params: Optional<Methods.SendContactParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendContact({
      chat_id: this.senderId,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends poll to current chat */
  async sendPoll(
    params: Optional<Methods.SendPollParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendPoll({
      chat_id: this.senderId,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Stops poll in current chat */
  async stopPoll(
    messageId: number,
    params?: Partial<Methods.StopPollParams>
  ): Promise<Poll> {
    const response = await this.telegram.api.stopPoll({
      chat_id: this.senderId,
      message_id: messageId,
      ...params
    })

    return new Poll(response)
  }

  /** Sends chat action to current chat */
  sendChatAction(
    action: Methods.SendChatActionParams['action'],
    params?: Optional<Methods.SendChatActionParams, 'chat_id'>
  ): Promise<true> {
    return this.telegram.api.sendChatAction({
      chat_id: this.senderId,
      action,
      ...params
    })
  }

  /** Sends sticker */
  async sendSticker(
    sticker: MediaInput,
    params?: Optional<Methods.SendStickerParams, 'sticker' | 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendSticker({
      sticker,
      chat_id: this.senderId,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends dice */
  async sendDice(
    emoji: Methods.SendDiceParams['emoji'],
    params?: Partial<Methods.SendDiceParams>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendDice({
      emoji,
      chat_id: this.senderId,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Gets commands */
  async getMyCommands(): Promise<BotCommand[]> {
    const response = await this.telegram.api.getMyCommands()

    return response.map(
      (command: Interfaces.TelegramBotCommand) => new BotCommand(command)
    )
  }
}

interface ChosenInlineResultContext extends ChosenInlineResult { }
applyMixins(ChosenInlineResultContext, [ChosenInlineResult])

inspectable(ChosenInlineResultContext, {
  serialize(result: ChosenInlineResultContext) {
    const payload = {
      resultId: result.resultId,
      from: result.from,
      senderId: result.senderId,
      location: result.location,
      inlineMessageId: result.inlineMessageId,
      query: result.query
    }

    return filterPayload(payload)
  }
})

export { ChosenInlineResultContext }
