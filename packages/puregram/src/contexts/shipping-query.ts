import { inspectable } from 'inspectable';

import { Context } from './context';

import {
  filterPayload,
  applyMixins
} from '../utils/helpers';

import { ShippingQuery, Message, Poll } from '../updates/';

import {
  TelegramShippingQuery,
  InputMediaPhoto,
  InputMediaVideo,
  TelegramBotCommand,
  TelegramMessage
} from '../interfaces';

import { Telegram } from '../telegram';

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
  SendChatActionParams
} from '../methods';

import { MessageContext } from './message';

import {
  TelegramInputFile,
  ChatAction,
  DiceEmoji,
  Optional
} from '../types';

import { BotCommand } from '../common/structures/bot-command';

class ShippingQueryContext extends Context {
  public payload: TelegramShippingQuery;

  constructor(telegram: Telegram, update: TelegramShippingQuery) {
    super(telegram, 'shipping_query');

    this.payload = update;
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

    return new MessageContext(this.telegram, response);
  }

  /** Sends photo to current chat */
  public async sendPhoto(
    photo: TelegramInputFile,
    params?: Optional<SendPhotoParams, 'chat_id' | 'photo'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendPhoto({
      ...params,
      chat_id: this.senderId,
      photo
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends audio to current chat */
  public async sendAudio(
    audio: TelegramInputFile,
    params?: Optional<SendAudioParams, 'chat_id' | 'audio'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendAudio({
      ...params,
      chat_id: this.senderId,
      audio
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends video to current chat */
  public async sendVideo(
    video: TelegramInputFile,
    params?: Optional<SendVideoParams, 'chat_id' | 'video'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVideo({
      ...params,
      chat_id: this.senderId,
      video
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends animation to current chat */
  public async sendAnimation(
    animation: TelegramInputFile,
    params?: Optional<SendAnimationParams, 'chat_id' | 'animation'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendAnimation({
      ...params,
      chat_id: this.senderId,
      animation
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends video note to current chat */
  public async sendVideoNote(
    videoNote: TelegramInputFile,
    params?: Optional<SendVideoNoteParams, 'chat_id' | 'video_note'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVideoNote({
      ...params,
      chat_id: this.senderId,
      video_note: videoNote
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends voice to current chat */
  public async sendVoice(
    voice: TelegramInputFile,
    params?: Optional<SendVoiceParams, 'chat_id' | 'voice'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVoice({
      ...params,
      chat_id: this.senderId,
      voice
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends media group to current chat */
  public async sendMediaGroup(
    mediaGroup: (InputMediaPhoto | InputMediaVideo)[],
    params?: Partial<SendMediaGroupParams>
  ): Promise<Message[]> {
    const response = await this.telegram.api.sendMediaGroup({
      ...params,
      chat_id: this.senderId,
      media: mediaGroup
    });

    return response.map(
      (message: TelegramMessage) => new Message(message)
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

    return new MessageContext(this.telegram, response);
  }

  /** Sends venue to current chat */
  public async sendVenue(
    params: Optional<SendVenueParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVenue({
      ...params,
      chat_id: this.senderId
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends contact to current chat */
  public async sendContact(
    params: Optional<SendContactParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendContact({
      ...params,
      chat_id: this.senderId
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends poll to current chat */
  public async sendPoll(
    params: Optional<SendPollParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendPoll({
      ...params,
      chat_id: this.senderId
    });

    return new MessageContext(this.telegram, response);
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
    action: ChatAction,
    params?: SendChatActionParams
  ): Promise<true> {
    return this.telegram.api.sendChatAction({
      ...params,
      chat_id: this.senderId,
      action
    });
  }

  /** Sends sticker */
  public async sendSticker(
    sticker: TelegramInputFile,
    params?: Optional<SendStickerParams, 'sticker' | 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendSticker({
      ...params,
      sticker,
      chat_id: this.senderId
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends dice */
  public async sendDice(
    emoji: DiceEmoji,
    params?: Partial<SendDiceParams>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendDice({
      ...params,
      emoji,
      chat_id: this.senderId
    });

    return new MessageContext(this.telegram, response);
  }

  /** Gets commands */
  public async getMyCommands(): Promise<BotCommand[]> {
    const response = await this.telegram.api.getMyCommands();

    return response.map(
      (command: TelegramBotCommand) => new BotCommand(command)
    );
  }
}

interface ShippingQueryContext extends ShippingQuery { }
applyMixins(ShippingQueryContext, [ShippingQuery]);

inspectable(ShippingQueryContext, {
  serialize(query: ShippingQueryContext) {
    const payload = {
      id: query.id,
      from: query.from,
      senderId: query.senderId,
      invoicePayload: query.invoicePayload,
      shippingAddress: query.shippingAddress
    };

    return filterPayload(payload);
  }
});

export { ShippingQueryContext };
