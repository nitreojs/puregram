import Params from '../../typings/params';
import Interfaces from '../../typings/interfaces';
import Types from '../../typings/types';

import MessageContext from '../contexts/message';

type MessageOrTrue = MessageContext | true;

declare class ReplyMessage {
  public constructor(telegram: Params.ITelegramParams, update: object);

  public id: string;

  public from?: Interfaces.IUser;

  public senderId?: number;

  public chat?: Interfaces.IChat;

  public chatId?: number;

  public chatType?: Types.ChatTypes;

  public forward?: ForwardMessage;

  /**
   * DEPRECATED, will be removed in v2.
   * Use `context.forward.from` instead
   */
  public forwardFrom?: Interfaces.IUser;

  /**
   * DEPRECATED, will be removed in v2.
   * Use `context.forward.chat` instead
   */
  public forwardFromChat?: Interfaces.IChat;

  /**
   * DEPRECATED, will be removed in v2.
   * Use `context.forward.messageId` instead
   */
  public forwardFromMessageId?: number;

  /**
   * DEPRECATED, will be removed in v2.
   * Use `context.forward.signature` instead
   */
  public forwardSignature?: string;

  /**
   * DEPRECATED, will be removed in v2.
   * Use `context.forward.senderName` instead
   */
  public forwardSenderName?: string;

  /**
   * DEPRECATED, will be removed in v2.
   * Use `context.forward.createdAt` instead
   */
  public forwardDate?: number;

  public replyMessage?: Interfaces.IMessage;

  public editDate?: number;

  public mediaGroupId?: string;

  public authorSignature?: string;

  public text?: string;

  public entities?: Array<Interfaces.IMessageEntity>;

  public hasEntities: boolean;

  public captionEntities?: Array<Interfaces.IMessageEntity>;

  public $match: RegExpMatchArray;

  public audio?: Interfaces.IAudio;

  public document?: Interfaces.IDocument;

  public animation?: Interfaces.IAnimation;

  public game?: Interfaces.IGame;

  public photo?: Interfaces.PhotoAttachment;

  public sticker?: Interfaces.ISticker;

  public video?: Interfaces.IVideo;

  public voice?: Interfaces.IVoice;

  public videoNote?: Interfaces.IVideoNote;

  public caption?: string;

  public contact?: Interfaces.IContact;

  public location?: Interfaces.ILocation;

  public venue?: Interfaces.IVenue;

  public poll?: Interfaces.IPoll;

  public dice?: Interfaces.IDice;

  public attachments: Array<Types.Attachments>;

  public hasAttachments(type?: Types.AttachmentTypes): boolean;

  public getAttachments(type: 'audio'): Array<Interfaces.IAudio>;

  public getAttachments(type: 'document'): Array<Interfaces.IDocument>;

  public getAttachments(type: 'animation'): Array<Interfaces.IAnimation>;

  public getAttachments(type: 'game'): Array<Interfaces.IGame>;

  public getAttachments(type: 'photo'): Array<Interfaces.PhotoAttachment>;

  public getAttachments(type: 'sticker'): Array<Interfaces.ISticker>;

  public getAttachments(type: 'video'): Array<Interfaces.IVideo>;

  public getAttachments(type: 'voice'): Array<Interfaces.IVoice>;

  public getAttachments(type: 'video_note' | 'videoNote'): Array<Interfaces.IVideoNote>;

  public getAttachments(type: 'contact'): Array<Interfaces.IContact>;

  public getAttachments(type: 'location'): Array<Interfaces.ILocation>;

  public getAttachments(type: 'venue'): Array<Interfaces.IVenue>;

  public getAttachments(type: 'poll'): Array<Interfaces.IPoll>;

  public getAttachments(type?: Types.AttachmentTypes): boolean;

  public newChatMembers?: Array<Interfaces.IUser>;

  public leftChatMember?: Interfaces.IUser;

  public newChatTitle?: string;

  public newChatPhoto?: Interfaces.PhotoAttachment;

  public deleteChatPhoto?: true;

  public groupChatCreated?: true;

  public supergroupChatCreated?: true;

  public channelChatCreated?: true;

  public migrateToChatId?: number;

  public migrateFromChatId?: number;

  public pinnedMessage?: Interfaces.IMessage;

  public invoice?: Interfaces.IInvoice;

  public successfulPayment?: Interfaces.ISuccessfulPayment;

  public connectedWebsite?: string;

  public passportData?: Interfaces.IPassportData;

  public replyMarkup?: Interfaces.IInlineKeyboardMarkup;

  public isEvent: boolean;

  public eventType?: string;

  public hasText: boolean;

  public isForward: boolean;

  public isPM: boolean;

  public isGroup: boolean;

  public isChannel: boolean;

  public isSupergroup: boolean;

  /**
   * Use this method to send text messages.
   *
   * On success, the sent `Message` is returned.
   */
  public send(text: string, params: Params.ISendMessageParams): Promise<MessageContext>;

  public reply(text: string, params: Params.ISendMessageParams): Promise<MessageContext>;

  /**
   * Use this method to send photos.
   *
   * On success, the sent `Message` is returned.
   */
  public sendPhoto(photo: Interfaces.IInputFile | string, params: Params.ISendPhotoParams): Promise<MessageContext>;

  public replyWithPhoto(photo: Interfaces.IInputFile | string, params: Params.ISendPhotoParams): Promise<MessageContext>;

  /**
   * Use this method to send audio files,
   * if you want Telegram clients to display them in the music player.
   * Your audio must be in the .MP3 or .M4A format.
   *
   * On success, the sent `Message` is returned.
   *
   * Bots can currently send audio files of up to 50 MB in size,
   * this limit may be changed in the future.
   *
   * For sending voice messages, use the `sendVoice` method instead.
   */
  public sendAudio(audio: Interfaces.IInputFile | string, params: Params.ISendAudioParams): Promise<MessageContext>;

  public replyWithAudio(audio: Interfaces.IInputFile | string, params: Params.ISendAudioParams): Promise<MessageContext>;

  /**
   * Use this method to send video files,
   * Telegram clients support mp4 videos
   * (other formats may be sent as `Document`).
   *
   * On success, the sent `Message` is returned.
   *
   * Bots can currently send video files of up to 50 MB in size,
   * this limit may be changed in the future.
   */
  public sendVideo(video: Interfaces.IInputFile | string, params: Params.ISendVideoParams): Promise<MessageContext>;

  public replyWithVideo(video: Interfaces.IInputFile | string, params: Params.ISendVideoParams): Promise<MessageContext>;

  /**
   * Use this method to send animation files
   * (GIF or H.264/MPEG-4 AVC video without sound).
   *
   * On success, the sent `Message` is returned.
   *
   * Bots can currently send animation files of up to 50 MB in size,
   * this limit may be changed in the future.
   */
  public sendAnimation(animation: Interfaces.IInputFile | string, params: Params.ISendAnimationParams): Promise<MessageContext>;

  public replyWithAnimation(animation: Interfaces.IInputFile | string, params: Params.ISendAnimationParams): Promise<MessageContext>;

  /**
   * As of v.4.0, Telegram clients support rounded square mp4 videos
   * of up to 1 minute long.
   * Use this method to send video messages.
   *
   * On success, the sent `Message` is returned.
   */
  public sendVideoNote(videoNote: Interfaces.IInputFile | string, params: Params.ISendVideoNoteParams): Promise<MessageContext>;

  public replyWithVideoNote(videoNote: Interfaces.IInputFile, params: Params.ISendVideoNoteParams): Promise<MessageContext>;

  /**
   * Use this method to send audio files,
   * if you want Telegram clients to display the file as a playable voice message.
   * For this to work, your audio must be in an .OGG file encoded with OPUS
   * (other formats may be sent as `Audio` or `Document`).
   *
   * On success, the sent `Message` is returned.
   *
   * Bots can currently send voice messages of up to 50 MB in size,
   * this limit may be changed in the future.
   */
  public sendVoice(voice: Interfaces.IInputFile | string, params: Params.ISendVoiceParams): Promise<MessageContext>;

  public replyWithVoice(voice: Interfaces.IInputFile | string, params: Params.ISendVoiceParams): Promise<MessageContext>;

  /**
   * Use this method to send a group of photos or videos as an album.
   *
   * On success, an `Array<Message>` is returned.
   */
  public sendMediaGroup(media: Array<Interfaces.IInputMediaPhoto | Interfaces.IInputMediaVideo>, params: Params.ISendMediaGroupParams): Promise<MessageContext>;

  public replyWithMediaGroup(media: Array<Interfaces.IInputMediaPhoto | Interfaces.IInputMediaVideo>, params: Params.ISendMediaGroupParams): Promise<MessageContext>;

  /**
   * Use this method to send point on the map.
   *
   * On success, the sent `Message` is returned.
   */
  public sendLocation(location: Params.ISendLocationParams, params?: Params.ISendLocationParams): Promise<MessageContext>;

  public replyWithLocation(location: Params.ISendLocationParams): Promise<MessageContext>;

  /**
   * Use this method to send information about a venue.
   *
   * On success, the sent `Message` is returned.
   */
  public sendVenue(venue: Params.ISendVenueParams, params?: Params.ISendVenueParams): Promise<MessageContext>;

  public replyWithVenue(venue: Params.ISendVenueParams, params?: Params.ISendVenueParams): Promise<MessageContext>;

  /**
   * Use this method to send phone contacts.
   *
   * On success, the sent `Message` is returned.
   */
  public sendContact(contact: Params.ISendContactParams, params?: Params.ISendContactParams): Promise<MessageContext>;

  public replyWithContact(contact: Params.ISendContactParams, params?: Params.ISendContactParams): Promise<MessageContext>;

  /**
   * Use this method to send a native poll.
   *
   * On success, the sent `Message` is returned.
   */
  public sendPoll(poll: Params.ISendPollParams, params?: Params.ISendPollParams): Promise<MessageContext>;

  public replyWithPoll(poll: Params.ISendPollParams, params?: Params.ISendPollParams): Promise<MessageContext>;

  /**
   * Use this method to stop a poll which was sent by the bot.
   *
   * On success, the stopped `Poll` with the final results is returned.
   */
  public stopPoll(id: string, params: Params.IStopPollParams): Promise<MessageContext>;

  /**
   * Use this method when you need to tell the user that
   * something is happening on the bot's side.
   * The status is set for 5 seconds or less
   * (when a message arrives from your bot,
   * Telegram clients clear its typing status).
   *
   * Returns `True` on success.
   */
  public sendChatAction(action: Types.ChatActions, params?: Params.ISendChatActionParams): Promise<true>;

  /**
   * Use this method to edit text and game messages.
   *
   * On success, if edited message is sent by the bot,
   * the edited `Message` is returned,
   * otherwise `True` is returned.
   */
  public editMessageText(text: string, params: Params.IEditMessageTextParams): Promise<MessageOrTrue>;

  /**
   * Use this method to edit captions of messages.
   *
   * On success, if edited message is sent by the bot,
   * the edited `Message` is returned,
   * otherwise `True` is returned.
   */
  public editMessageCaption(caption: string, params: Params.IEditMessageCaptionParams): Promise<MessageOrTrue>;

  /**
   * Use this method to edit animation, audio, document,
   * photo, or video messages.
   * If a message is a part of a message album,
   * then it can be edited only to a photo or a video.
   * Otherwise, message type can be changed arbitrarily.
   * When inline message is edited, new file can't be uploaded.
   * Use previously uploaded file via its `file_id` or specify a `URL`.
   *
   * On success, if the edited message was sent by the bot,
   * the edited `Message` is returned,
   * otherwise `True` is returned.
   */
  public editMessageMedia(media: string, params: Params.IEditMessageMediaParams): Promise<MessageOrTrue>;

  /**
   * Use this method to edit only the reply markup of messages.
   *
   * On success, if edited message is sent by the bot,
   * the edited `Message` is returned,
   * otherwise `True` is returned.
   */
  public editMessageReplyMarkup(replymarkup: string, params: Params.IEditMessageReplyMarkupParams): Promise<MessageOrTrue>;

  /**
   * Use this method to delete a message, including service messages, with the following limitations:
   * - A message can only be deleted if it was sent less than 48 hours ago.
   * - Bots can delete outgoing messages in private chats, groups, and supergroups.
   * - Bots can delete incoming messages in private chats.
   * - Bots granted can_post_messages permissions can delete outgoing messages in channels.
   * - If the bot is an administrator of a group, it can delete any message there.
   * - If the bot has can_delete_messages permission in a supergroup or a channel, it can delete any message there.
   *
   * Returns `True` on success.
   */
  public deleteMessage(params: Params.IDeleteMessageParams): Promise<true>;

  /**
   * Use this method to send static .WEBP or animated .TGS stickers.
   *
   * On success, the sent `Message` is returned.
   */
  public sendSticker(sticker: Interfaces.IInputFile | string, params: Params.ISendStickerParams): Promise<MessageContext>;

  /**
   * Use this method to send a dice, which will have a random value from `1` to `6`.
   *
   * On success, the sent `Message` is returned.
   */
  public sendDice(params: Params.ISendDiceParams): Promise<MessageContext>;

  /**
   * Use this method to get the current list of the bot's commands.
   *
   * Returns `Array<BotCommand>` on success.
   */
  public getMyCommands(): Promise<Array<Interfaces.IBotCommand>>;

  /**
   * Use this method to change the list of the bot's commands.
   *
   * Returns `True` on success.
   */
  public setMyCommands(commands: Array<Interfaces.IBotCommand>): Promise<true>;

  /**
   * Use this method to edit live location messages.
   * A location can be edited until its live_period expires
   * or editing is explicitly disabled by a call to `stopMessageLiveLocation`.
   *
   * On success, if the edited message was sent by the bot,
   * the edited `Message` is returned, otherwise `True` is returned.
   */
  public editMessageLiveLocation(params: Params.IEditMessageLiveLocationParams): Promise<MessageOrTrue>;

  /**
   * Use this method to stop updating a live location message
   * before live_period expires.
   *
   * On success, if the message was sent by the bot,
   * the sent `Message` is returned, otherwise `True` is returned.
   */
  public stopMessageLiveLocation(params: Params.IStopMessageLiveLocationParams): Promise<MessageOrTrue>;
}

export = ReplyMessage;
