import { inspectable } from 'inspectable';

import { Context } from './context';
import { applyMixins } from '../utils/helpers';
import { Telegram } from '../telegram';

import {
  PollAnswer,
  Message,
  Poll
} from '../updates/';

import {
  InputMediaPhoto,
  InputMediaVideo,
  TelegramBotCommand,
  TelegramPollAnswer,
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
  SendStickerParams,
  SendDiceParams,
  SendChatActionParams
} from '../methods';

import { MessageContext } from './message';

import {
  TelegramInputFile,
  ChatAction,
  DiceEmoji,
  PickPartial
} from '../types';

import { BotCommand } from '../common/structures/bot-command';

class PollAnswerContext extends Context {
  public payload: TelegramPollAnswer;

  constructor(telegram: Telegram, update: TelegramPollAnswer) {
    super(telegram, 'poll_answer');

    this.payload = update;
  }

  /** Sends message to current chat */
  public async send(
    text: string,
    params?: PickPartial<SendMessageParams, 'chat_id' | 'text'>
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
    params?: PickPartial<SendPhotoParams, 'chat_id' | 'photo'>
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
    params?: PickPartial<SendAudioParams, 'chat_id' | 'audio'>
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
    params?: PickPartial<SendVideoParams, 'chat_id' | 'video'>
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
    params?: PickPartial<SendAnimationParams, 'chat_id' | 'animation'>
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
    params?: PickPartial<SendVideoNoteParams, 'chat_id' | 'video_note'>
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
    params?: PickPartial<SendVoiceParams, 'chat_id' | 'voice'>
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
    params?: PickPartial<SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
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
    params: PickPartial<SendVenueParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVenue({
      ...params,
      chat_id: this.senderId
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends contact to current chat */
  public async sendContact(
    params: PickPartial<SendContactParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendContact({
      ...params,
      chat_id: this.senderId
    });

    return new MessageContext(this.telegram, response);
  }

  /** Sends poll to current chat */
  public async sendPoll(
    params: PickPartial<SendPollParams, 'chat_id'>
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
    params?: PickPartial<SendStickerParams, 'sticker' | 'chat_id'>
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

interface PollAnswerContext extends PollAnswer { }
applyMixins(PollAnswerContext, [PollAnswer]);

inspectable(PollAnswerContext, {
  serialize(answer: PollAnswerContext) {
    return {
      pollId: answer.pollId,
      user: answer.user,
      senderId: answer.senderId,
      optionIds: answer.optionIds
    };
  }
});

export { PollAnswerContext };
