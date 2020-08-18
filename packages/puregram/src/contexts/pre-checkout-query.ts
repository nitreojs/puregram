import { inspectable } from 'inspectable';

import { Context } from './context';

import {
  filterPayload,
  applyMixins
} from '../utils/helpers';

import { PreCheckoutQuery } from '../updates/pre-checkout-query';
import { Telegram } from '../telegram';

import {
  InputMediaPhoto,
  InputMediaVideo,
  TelegramBotCommand,
  TelegramPreCheckoutQuery,
  TelegramMessage
} from '../interfaces';

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
  SendChatActionParams,
  GetUserProfilePhotosParams,
  SendStickerParams,
  SendDiceParams
} from '../methods';

import { MessageContext } from './message';

import {
  TelegramInputFile,
  ChatAction,
  DiceEmoji
} from '../types';

import { Message } from '../updates/message';
import { Poll } from '../updates/index';
import { UserProfilePhotos } from '../common/structures/user-profile-photos';
import { BotCommand } from '../common/structures/bot-command';

class PreCheckoutQueryContext extends Context {
  public payload: TelegramPreCheckoutQuery;

  constructor(telegram: Telegram, update: TelegramPreCheckoutQuery) {
    super(telegram, 'pre_checkout_query');

    this.payload = update;
  }

  /** Sends message to current chat */
  public async send(
    text: string,
    params?: Partial<SendMessageParams>
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
    params?: Partial<SendPhotoParams>
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
    params?: Partial<SendAudioParams>
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
    params?: Partial<SendVideoParams>
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
    params?: Partial<SendAnimationParams>
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
    params?: Partial<SendVideoNoteParams>
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
    params?: Partial<SendVoiceParams>
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
    params?: Partial<SendLocationParams>
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
    params: SendVenueParams
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVenue({
      ...params,
      chat_id: this.senderId
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends contact to current chat */
  public async sendContact(
    params: SendContactParams
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendContact({
      ...params,
      chat_id: this.senderId
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends poll to current chat */
  public async sendPoll(
    params: SendPollParams
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

  /** Gets user's profile photos */
  public async getUserProfilePhotos(
    params?: Partial<GetUserProfilePhotosParams>
  ): Promise<UserProfilePhotos> {
    const response = await this.telegram.api.getUserProfilePhotos({
      ...params,
      user_id: this.senderId
    });

    return new UserProfilePhotos(response);
  }

  /** Sends sticker */
  public async sendSticker(
    sticker: TelegramInputFile,
    params?: Partial<SendStickerParams>
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

  /** Sets commands */
  public async setMyCommands(
    commands: TelegramBotCommand[]
  ): Promise<true> {
    const response = await this.telegram.api.setMyCommands({
      commands
    });

    return response;
  }
}

interface PreCheckoutQueryContext extends PreCheckoutQuery { }
applyMixins(PreCheckoutQueryContext, [PreCheckoutQuery]);

inspectable(PreCheckoutQueryContext, {
  serialize(query: PreCheckoutQueryContext) {
    const payload = {
      id: query.id,
      from: query.from,
      senderId: query.senderId,
      currency: query.currency,
      totalAmount: query.totalAmount,
      invoicePayload: query.invoicePayload,
      shippingOptionId: query.shippingOptionId,
      orderInfo: query.orderInfo
    };

    return filterPayload(payload);
  }
});

export { PreCheckoutQueryContext };