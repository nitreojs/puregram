import { inspectable } from 'inspectable';

import { Context } from './context';
import { Telegram } from '../telegram';
import { Message } from '../updates/';

import {
  AttachmentType as AttachmentTypeEnum,
  EntityType as EntityTypeEnum
} from '../enums';

import {
  InputMediaUnion,
  TelegramBotCommand,
  TelegramInlineKeyboardMarkup,
  TelegramMessage
} from '../interfaces';

import {
  applyMixins,
  filterPayload,
  isParseable
} from '../utils/helpers';

import {
  AttachmentType,
  ChatAction,
  ChatType,
  DiceEmoji,
  EntityType,
  MessageEventName,
  Optional,
  TelegramInputFile,
  UpdateName
} from '../types';

import { events } from '../utils/constants';

import {
  EditMessageCaptionParams,
  EditMessageLiveLocationParams,
  EditMessageMediaParams,
  EditMessageReplyMarkupParams,
  EditMessageTextParams,
  SendAnimationParams,
  SendAudioParams,
  SendContactParams,
  SendDiceParams,
  SendDocumentParams,
  SendInvoiceParams,
  SendLocationParams,
  SendMediaGroupParams,
  SendMessageParams,
  SendPhotoParams,
  SendPollParams,
  SendStickerParams,
  SendVenueParams,
  SendVideoNoteParams,
  SendVideoParams,
  SendVoiceParams,
  StopMessageLiveLocationParams,
  StopPollParams
} from '../methods';

import { Poll } from '../updates/';
import { BotCommand } from '../common/structures/bot-command';
import { MessageEntity } from '../common/structures/message-entity';

import {
  AnimationAttachment,
  Attachment,
  AudioAttachment,
  DocumentAttachment,
  PhotoAttachment,
  StickerAttachment,
  VideoAttachment,
  VideoNoteAttachment,
  VoiceAttachment
} from '../common/attachments';

/** Called when `message` event occurs */
class MessageContext extends Context {
  public payload: TelegramMessage;

  constructor(telegram: Telegram, update: TelegramMessage, type: UpdateName = 'message') {
    super(telegram, type);

    this.payload = update;
  }

  /** Sender's ID */
  public get senderId(): number | undefined {
    return this.from?.id;
  }

  /** Chat ID */
  public get chatId(): number | undefined {
    return this.chat?.id;
  }

  /** Chat type */
  public get chatType(): ChatType | undefined {
    return this.chat?.type;
  }

  /** Is this chat a private one? */
  public get isPM(): boolean {
    return this.chatType === 'private';
  }

  /** Is this chat a group? */
  public get isGroup(): boolean {
    return this.chatType === 'group';
  }

  /** Is this chat a supergroup? */
  public get isSupergroup(): boolean {
    return this.chatType === 'supergroup';
  }

  /** Is this chat a channel? */
  public get isChannel(): boolean {
    return this.chatType === 'channel';
  }

  /** Checks if the message has `dice` property */
  public get hasDice(): boolean {
    return this.dice !== undefined;
  }

  public get startPayload(): any {
    if (!this.hasText) return undefined;
    if (!this.text!.startsWith('/start') || this.text === '/start') {
      return undefined;
    }

    let payload: any = this.text!.split(' ')[1];

    if (!Number.isNaN(+payload)) {
      payload = Number.parseInt(payload, 10);
    } else if (isParseable(payload)) {
      payload = JSON.parse(payload);
    }

    return payload;
  }

  /** Checks if the message has `text` property */
  public get hasText(): boolean {
    return this.text !== undefined;
  }

  /** Checks if the message has `author_signature` property */
  public get hasAuthorSignature(): boolean {
    return this.authorSignature !== undefined;
  }

  /** Checks if there are any entities (with specified type) */
  public hasEntities(type?: EntityTypeEnum | EntityType): boolean {
    if (type === undefined) return this.entities.length !== 0;

    return this.entities.some(
      (entity: MessageEntity) => entity.type === type
    );
  }

  /** Checks if the message has `caption` property */
  public get hasCaption(): boolean {
    return this.caption !== undefined;
  }

  /** Checks if there are any caption entities (with specified type) */
  public hasCaptionEntities(type?: EntityTypeEnum | EntityType): boolean {
    if (type === undefined) return this.captionEntities.length !== 0;

    return this.captionEntities.some(
      (entity: MessageEntity) => entity.type === type
    );
  }

  /** Message attachments */
  public get attachments(): Attachment[] {
    const attachments: Attachment[] = [];

    if (this.audio) attachments.push(this.audio);
    if (this.document) attachments.push(this.document);
    if (this.animation) attachments.push(this.animation);
    if (this.photo) attachments.push(new PhotoAttachment(this.photo));
    if (this.sticker) attachments.push(this.sticker);
    if (this.video) attachments.push(this.video);
    if (this.voice) attachments.push(this.voice);
    if (this.videoNote) attachments.push(this.videoNote);
    if (this.venue) attachments.push(this.venue);

    return attachments;
  }

  /** Checks if there are attachments */
  public hasAttachments(type?: AttachmentType | AttachmentTypeEnum): boolean {
    if (type === undefined) return this.attachments.length > 0;

    return this.attachments.some(
      (attachment: Attachment) => attachment.attachmentType === type
    );
  }

  /** Gets attachments */
  public getAttachments(type?: AttachmentType | AttachmentTypeEnum): Attachment[];

  public getAttachments(type: AttachmentTypeEnum.ANIMATION | 'animation'): AnimationAttachment[];

  public getAttachments(type: AttachmentTypeEnum.AUDIO | 'audio'): AudioAttachment[];

  public getAttachments(type: AttachmentTypeEnum.DOCUMENT | 'document'): DocumentAttachment[];

  public getAttachments(type: AttachmentTypeEnum.PHOTO | 'photo'): PhotoAttachment[];

  public getAttachments(type: AttachmentTypeEnum.STICKER | 'sticker'): StickerAttachment[];

  public getAttachments(type: AttachmentTypeEnum.VIDEO | 'video'): VideoAttachment[];

  public getAttachments(type: AttachmentTypeEnum.VIDEO_NOTE | 'video_note'): VideoNoteAttachment[];

  public getAttachments(type: AttachmentTypeEnum.VOICE | 'voice'): VoiceAttachment[];
  
  public getAttachments(type?: any): Attachment[] {
    if (type === undefined) return this.attachments;

    return this.attachments.filter(
      (attachment: Attachment) => attachment.attachmentType === type
    );
  }

  /** Is this message an event? */
  public get isEvent(): boolean {
    return events.some(
      (event) => Boolean(
        this[
          event[0] as keyof Message
        ]
      )
    );
  }

  /** Event type */
  public get eventType(): MessageEventName | undefined {
    if (!this.isEvent) return undefined;

    const value: (
      [keyof Message, MessageEventName] | undefined
    ) = events.find(
      (event) => {
        const tValue = this[
          event[0] as keyof Message
        ];

        if (Array.isArray(tValue)) {
          return tValue.length !== 0;
        }

        return tValue !== undefined;
      }
    );

    if (value === undefined) return undefined;

    return value[1];
  }

  /** Is this message a forwarded one? */
  public get isForward(): boolean {
    return this.forwardMessage !== undefined;
  }

  /** Does this message have reply message? */
  public get hasReplyMessage(): boolean {
    return this.replyMessage !== undefined;
  }

  /** Checks if the sent message has `via_bot` property */
  public get hasViaBot(): boolean {
    return this.viaBot !== undefined;
  }

  /** Sends message to current chat */
  public async send(
    text: string,
    params?: Optional<SendMessageParams, 'chat_id' | 'text'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendMessage({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      text
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message */
  public reply(
    text: string,
    params?: Optional<SendMessageParams, 'chat_id' | 'text'>
  ): Promise<MessageContext> {
    return this.send(text, {
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends photo to current chat */
  public async sendPhoto(
    photo: TelegramInputFile,
    params?: Optional<SendPhotoParams, 'chat_id' | 'photo'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendPhoto({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      photo
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message with photo */
  public replyWithPhoto(
    photo: TelegramInputFile,
    params?: Optional<SendPhotoParams, 'chat_id' | 'photo'>
  ): Promise<MessageContext> {
    return this.sendPhoto(photo, {
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends document to current chat */
  public async sendDocument(
    document: TelegramInputFile,
    params?: Optional<SendDocumentParams, 'chat_id' | 'document'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendDocument({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      document
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message with document */
  public replyWithDocument(
    document: TelegramInputFile,
    params?: Optional<SendDocumentParams, 'chat_id' | 'document'>
  ): Promise<MessageContext> {
    return this.sendDocument(document, {
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends audio to current chat */
  public async sendAudio(
    audio: TelegramInputFile,
    params?: Optional<SendAudioParams, 'chat_id' | 'audio'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendAudio({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      audio
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message with audio */
  public replyWithAudio(
    audio: TelegramInputFile,
    params?: Optional<SendAudioParams, 'chat_id' | 'audio'>
  ): Promise<MessageContext> {
    return this.sendAudio(audio, {
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends video to current chat */
  public async sendVideo(
    video: TelegramInputFile,
    params?: Optional<SendVideoParams, 'chat_id' | 'video'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVideo({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      video
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message with video */
  public replyWithVideo(
    video: TelegramInputFile,
    params?: Optional<SendVideoParams, 'chat_id' | 'video'>
  ): Promise<MessageContext> {
    return this.sendVideo(video, {
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends animation to current chat */
  public async sendAnimation(
    animation: TelegramInputFile,
    params?: Optional<SendAnimationParams, 'chat_id' | 'animation'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendAnimation({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      animation
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message with animation */
  public replyWithAnimation(
    animation: TelegramInputFile,
    params?: Optional<SendAnimationParams, 'chat_id' | 'animation'>
  ): Promise<MessageContext> {
    return this.sendAnimation(animation, {
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends video note to current chat */
  public async sendVideoNote(
    videoNote: TelegramInputFile,
    params?: Optional<SendVideoNoteParams, 'chat_id' | 'video_note'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVideoNote({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      video_note: videoNote
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message with video note */
  public replyWithVideoNote(
    videoNote: TelegramInputFile,
    params?: Optional<SendVideoNoteParams, 'chat_id' | 'video_note'>
  ): Promise<MessageContext> {
    return this.sendVideoNote(videoNote, {
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends voice to current chat */
  public async sendVoice(
    voice: TelegramInputFile,
    params?: Optional<SendVoiceParams, 'chat_id' | 'voice'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVoice({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      voice
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message with voice */
  public replyWithVoice(
    voice: TelegramInputFile,
    params?: Optional<SendVoiceParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendVoice(voice, {
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends media group to current chat */
  public async sendMediaGroup(
    mediaGroup: SendMediaGroupParams['media'],
    params?: Optional<SendMediaGroupParams, 'chat_id' | 'media'>
  ): Promise<MessageContext[]> {
    const response = await this.telegram.api.sendMediaGroup({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      media: mediaGroup
    });

    return response.map(
      (message: TelegramMessage) => new MessageContext(this.telegram, message)
    );
  }

  /** Replies to current message with media group */
  public replyWithMediaGroup(
    mediaGroup: SendMediaGroupParams['media'],
    params?: Optional<SendMediaGroupParams, 'chat_id' | 'media'>
  ): Promise<MessageContext[]> {
    return this.sendMediaGroup(mediaGroup, {
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends location to current chat */
  public async sendLocation(
    latitude: number,
    longitude: number,
    params?: Optional<SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendLocation({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      latitude,
      longitude
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message with location */
  public replyWithLocation(
    latitude: number,
    longitude: number,
    params?: Optional<SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ): Promise<MessageContext> {
    return this.sendLocation(latitude, longitude, {
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends invoice to current user */
  public async sendInvoice(
    params: Optional<SendInvoiceParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendInvoice({
      ...params,
      chat_id: this.chatId || this.senderId || 0
    });

    return new MessageContext(this.telegram, response);
  }

  /** Edits current message live location */
  public async editMessageLiveLocation(
    params: EditMessageLiveLocationParams
  ): Promise<true | MessageContext> {
    const response = await this.telegram.api.editMessageLiveLocation({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    });

    if (response === true) {
      return true;
    }

    return new MessageContext(this.telegram, response);
  }

  /** Stops current message live location */
  public async stopMessageLiveLocation(
    params?: StopMessageLiveLocationParams
  ): Promise<true | MessageContext> {
    const response = await this.telegram.api.stopMessageLiveLocation({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    });

    if (response === true) return true;

    return new MessageContext(this.telegram, response);
  }

  /** Sends venue to current chat */
  public async sendVenue(
    params: Optional<SendVenueParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVenue({
      ...params,
      chat_id: this.chatId || this.senderId || 0
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message with venue */
  public replyWithVenue(
    params: Optional<SendVenueParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendVenue({
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends contact to current chat */
  public async sendContact(
    params: Optional<SendContactParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendContact({
      ...params,
      chat_id: this.chatId || this.senderId || 0
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message with contact */
  public replyWithContact(
    params: Optional<SendContactParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendContact({
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Sends poll to current chat */
  public async sendPoll(
    params: Optional<SendPollParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendPoll({
      ...params,
      chat_id: this.chatId || this.senderId || 0
    });

    return new MessageContext(this.telegram, response);
  }

  /** Replies to current message with poll */
  public replyWithPoll(
    params: Optional<SendPollParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendPoll({
      ...params,
      reply_to_message_id: this.id
    });
  }

  /** Stops poll in current chat */
  public async stopPoll(
    messageId: number,
    params?: Partial<StopPollParams>
  ): Promise<Poll> {
    const response = await this.telegram.api.stopPoll({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      message_id: messageId
    });

    return new Poll(response);
  }

  /** Sends chat action to current chat */
  public sendChatAction(action: ChatAction): Promise<true> {
    return this.telegram.api.sendChatAction({
      chat_id: this.chatId || this.senderId || 0,
      action
    });
  }

  /** Deletes current message */
  public deleteMessage(): Promise<true> {
    return this.telegram.api.deleteMessage({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
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
      chat_id: this.chatId || this.senderId || 0
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
      chat_id: this.chatId || this.senderId || 0
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

  // Edit methods

  /** Edits current message text */
  public async editMessageText(
    text: string,
    params?: Partial<EditMessageTextParams>
  ): Promise<true | MessageContext> {
    const response = await this.telegram.api.editMessageText({
      ...params,
      text,
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    });

    if (response === true) {
      return true;
    }

    return new MessageContext(this.telegram, response);
  }

  /** Edits current message caption */
  public async editMessageCaption(
    caption: string,
    params?: Partial<EditMessageCaptionParams>
  ): Promise<true | MessageContext> {
    const response = await this.telegram.api.editMessageCaption({
      ...params,
      caption,
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    });

    if (response === true) {
      return true;
    }

    return new MessageContext(this.telegram, response);
  }

  /** Edits current message media */
  public async editMessageMedia(
    media: InputMediaUnion,
    params?: Partial<EditMessageMediaParams>
  ): Promise<true | MessageContext> {
    const response = await this.telegram.api.editMessageMedia({
      ...params,
      media,
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    });

    if (response === true) {
      return true;
    }

    return new MessageContext(this.telegram, response);
  }

  /** Edits current message reply markup */
  public async editMessageReplyMarkup(
    replyMarkup: TelegramInlineKeyboardMarkup,
    params?: Partial<EditMessageReplyMarkupParams>
  ): Promise<true | MessageContext> {
    const response = await this.telegram.api.editMessageReplyMarkup({
      ...params,
      reply_markup: replyMarkup,
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    });

    if (response === true) {
      return true;
    }

    return new MessageContext(this.telegram, response);
  }
}

interface MessageContext extends Message { }
applyMixins(MessageContext, [Message]);

inspectable(MessageContext, {
  serialize(message: MessageContext) {
    const payload = {
      id: message.id,
      from: message.from,
      createdAt: message.createdAt,
      chat: message.chat,
      forwardMessage: message.forwardMessage,
      replyMessage: message.replyMessage,
      viaBot: message.viaBot,
      updatedAt: message.updatedAt,
      mediaGroupId: message.mediaGroupId,
      authorSignature: message.authorSignature,
      text: message.text,
      entities: message.entities,
      captionEntities: message.captionEntities,
      dice: message.dice,
      attachments: message.attachments,
      caption: message.caption,
      contact: message.contact,
      location: message.location,
      venue: message.venue,
      poll: message.poll,
    };

    return filterPayload(payload);
  }
});

export { MessageContext };
