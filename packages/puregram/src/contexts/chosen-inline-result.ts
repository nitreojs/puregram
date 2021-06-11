import { inspectable } from 'inspectable';

import { Context } from './context';
import { MessageContext } from './message';

import {
  filterPayload,
  applyMixins
} from '../utils/helpers';

import {
  TelegramBotCommand,
  TelegramChosenInlineResult,
  TelegramMessage,
  InputFile,
  TelegramUpdate
} from '../telegram-interfaces';

import { Optional } from '../types';

import {
  SendMessageParams,
  SendPhotoParams,
  SendAudioParams,
  SendVideoParams,
  SendAnimationParams,
  SendVideoNoteParams,
  SendVoiceParams,
  SendMediaGroupParams,
  SendLocationParams,
  SendVenueParams,
  SendContactParams,
  SendPollParams,
  StopPollParams,
  SendStickerParams,
  SendDiceParams,
  SendChatActionParams,
  SendDocumentParams
} from '../methods';

import { Poll, ChosenInlineResult } from '../updates/';
import { BotCommand } from '../common/structures/bot-command';
import { Telegram } from '../telegram';

interface ChosenInlineResultContextOptions {
  telegram: Telegram;
  update: TelegramUpdate;
  payload: TelegramChosenInlineResult;
  updateId: number;
}

/**
 * The result of an inline query that was chosen by
 * a user and sent to their chat partner
 */
class ChosenInlineResultContext extends Context {
  public payload: TelegramChosenInlineResult;

  constructor(options: ChosenInlineResultContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'chosen_inline_result',
      updateId: options.updateId,
      update: options.update
    });

    this.payload = options.payload;
  }

  /** Sends message to current chat */
  public async send(
    text: string,
    params?: Optional<SendMessageParams, 'chat_id' | 'text'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendMessage({
      ...params,
      chat_id: this.senderId,
      text
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends photo to current chat */
  public async sendPhoto(
    photo: InputFile,
    params?: Optional<SendPhotoParams, 'chat_id' | 'photo'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendPhoto({
      ...params,
      chat_id: this.senderId,
      photo
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends document to current chat */
  public async sendDocument(
    document: InputFile,
    params?: Optional<SendDocumentParams, 'chat_id' | 'document'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendDocument({
      ...params,
      chat_id: this.senderId,
      document
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends audio to current chat */
  public async sendAudio(
    audio: InputFile,
    params?: Optional<SendAudioParams, 'chat_id' | 'audio'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendAudio({
      ...params,
      chat_id: this.senderId,
      audio
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends video to current chat */
  public async sendVideo(
    video: InputFile,
    params?: Optional<SendVideoParams, 'chat_id' | 'video'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVideo({
      ...params,
      chat_id: this.senderId,
      video
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends animation to current chat */
  public async sendAnimation(
    animation: InputFile,
    params?: Optional<SendAnimationParams, 'chat_id' | 'animation'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendAnimation({
      ...params,
      chat_id: this.senderId,
      animation
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends video note to current chat */
  public async sendVideoNote(
    videoNote: InputFile,
    params?: Optional<SendVideoNoteParams, 'chat_id' | 'video_note'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVideoNote({
      ...params,
      chat_id: this.senderId,
      video_note: videoNote
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends voice to current chat */
  public async sendVoice(
    voice: InputFile,
    params?: Optional<SendVoiceParams, 'chat_id' | 'voice'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVoice({
      ...params,
      chat_id: this.senderId,
      voice
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends media group to current chat */
  public async sendMediaGroup(
    mediaGroup: SendMediaGroupParams['media'],
    params?: Partial<SendMediaGroupParams>
  ): Promise<MessageContext[]> {
    const response = await this.telegram.api.sendMediaGroup({
      ...params,
      chat_id: this.senderId,
      media: mediaGroup
    });

    return response.map(
      (message: TelegramMessage) => new MessageContext({
        telegram: this.telegram,
        payload: message
      })
    );
  }

  /** Sends location to current chat */
  public async sendLocation(
    latitude: number,
    longitude: number,
    params?: Optional<SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendLocation({
      ...params,
      chat_id: this.senderId,
      latitude,
      longitude
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends venue to current chat */
  public async sendVenue(
    params: Optional<SendVenueParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVenue({
      ...params,
      chat_id: this.senderId
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends contact to current chat */
  public async sendContact(
    params: Optional<SendContactParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendContact({
      ...params,
      chat_id: this.senderId
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends poll to current chat */
  public async sendPoll(
    params: Optional<SendPollParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendPoll({
      ...params,
      chat_id: this.senderId
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Stops poll in current chat */
  public async stopPoll(
    messageId: number,
    params?: Partial<StopPollParams>
  ): Promise<Poll> {
    const response = await this.telegram.api.stopPoll({
      ...params,
      chat_id: this.senderId,
      message_id: messageId
    });

    return new Poll(response);
  }

  /** Sends chat action to current chat */
  public sendChatAction(
    action: SendChatActionParams['action'],
    params?: Optional<SendChatActionParams, 'chat_id'>
  ): Promise<true> {
    return this.telegram.api.sendChatAction({
      ...params,
      chat_id: this.senderId,
      action
    });
  }

  /** Sends sticker */
  public async sendSticker(
    sticker: InputFile,
    params?: Optional<SendStickerParams, 'sticker' | 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendSticker({
      ...params,
      sticker,
      chat_id: this.senderId
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Sends dice */
  public async sendDice(
    emoji: SendDiceParams['emoji'],
    params?: Partial<SendDiceParams>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendDice({
      ...params,
      emoji,
      chat_id: this.senderId
    });

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    });
  }

  /** Gets commands */
  public async getMyCommands(): Promise<BotCommand[]> {
    const response = await this.telegram.api.getMyCommands();

    return response.map(
      (command: TelegramBotCommand) => new BotCommand(command)
    );
  }
}

interface ChosenInlineResultContext extends ChosenInlineResult { }
applyMixins(ChosenInlineResultContext, [ChosenInlineResult]);

inspectable(ChosenInlineResultContext, {
  serialize(result: ChosenInlineResultContext) {
    const payload = {
      resultId: result.resultId,
      from: result.from,
      senderId: result.senderId,
      location: result.location,
      inlineMessageId: result.inlineMessageId,
      query: result.query
    };

    return filterPayload(payload);
  }
});

export { ChosenInlineResultContext };
