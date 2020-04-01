import Params from "../../typings/params";
import Interfaces from "../../typings/interfaces";
import Types from '../../typings/types';
import MessageContext from './message';
import ReplyMessageContext from './reply-message';
import Context from './context';

type MessageOrTrue = MessageContext | true;

declare class ChannelPost extends Context {
  public constructor(telegram: Params.ITelegramParams, update: object);

  public id: string;

  public from?: Interfaces.IUser;

  public senderId?: number;

  public isOutbox?: boolean;

  public date?: number;

  public chat?: Interfaces.IChat;

  public chatId?: number;

  public chatType?: Types.ChatTypes;

  public forwardFrom?: User;

  public forwardFromChat?: User;

  public forwardFromMessageId?: number;

  public forwardSignature?: string;

  public forwardSenderName?: string;

  public forwardDate?: number;

  public isForward: boolean;

  public replyMessage?: ReplyMessageContext;

  public editDate?: number;

  public mediaGroupId?: string;

  public authorSignature?: string;

  public text?: string;

  public entities?: Array<MessageEntity>;

  public hasEntities: boolean;

  public captionEntities?: Array<MessageEntity>;

  public audio?: Audio;

  public document?: Document;

  public animation?: Animation;

  public game?: Game;

  public photo?: Array<PhotoSize>;

  public sticker?: Sticker;

  public video?: Video;

  public voice?: Voice;

  public videoNote?: VideoNote;

  public caption?: string;

  public contact?: Contact;

  public location?: Location;

  public venue?: Venue;

  public poll?: Poll;

  public dice?: Dice;

  public attachments: Array<Attachment>;

  public hasAttachments(type?: Types.AttachmentTypes): boolean;

  public getAttachments(type: 'audio'): Array<Audio>;

  public getAttachments(type: 'document'): Array<Document>;

  public getAttachments(type: 'animation'): Array<Animation>;

  public getAttachments(type: 'game'): Array<Game>;

  public getAttachments(type: 'photo'): Array<Array<PhotoSize>>;

  public getAttachments(type: 'sticker'): Array<Sticker>;

  public getAttachments(type: 'video'): Array<Video>;

  public getAttachments(type: 'voice'): Array<Voice>;

  public getAttachments(type: 'video_note' | 'videoNote'): Array<VideoNote>;

  public getAttachments(type: 'contact'): Array<Contact>;

  public getAttachments(type: 'location'): Array<Location>;

  public getAttachments(type: 'venue'): Array<Venue>;

  public getAttachments(type: 'poll'): Array<Poll>;

  public getAttachments(type?: Types.AttachmentTypes): boolean;

  public newChatMembers?: Array<User>;

  public leftChatMember?: User;

  public newChatTitle?: string;

  public newChatPhoto?: Array<PhotoSize>;

  public deleteChatPhoto?: true;

  public groupChatCreated?: true;

  public supergroupChatCreated?: true;

  public channelChatCreated?: true;

  public migrateToChatId?: number;

  public migrateFromChatId?: number;

  public pinnedMessage?: MessageContext;

  public invoice?: Invoice;

  public successfulPayment?: SuccessfulPayment;

  public connectedWebsite?: string;

  public passportData?: PassportData;

  public replyMarkup?: InlineKeyboardMarkup;

  public isEvent: boolean;

  public eventType?: string;

  public hasText: boolean;

  public hasForward: boolean;

  public isPM: boolean;

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

  public replyWithPhoto(photo: string, params: Params.ISendPhotoParams): Promise<MessageContext>;

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

  public replyWithAudio(audio: string, params: Params.ISendAudioParams): Promise<MessageContext>;

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

  public replyWithVideo(video: string, params: Params.ISendVideoParams): Promise<MessageContext>;

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

  public replyWithAnimation(animation: string, params: Params.ISendAnimationParams): Promise<MessageContext>;

  /**
   * As of v.4.0, Telegram clients support rounded square mp4 videos
   * of up to 1 minute long.
   * Use this method to send video messages.
   * 
   * On success, the sent `Message` is returned.
   */
  public sendVideoNote(videoNote: Interfaces.IInputFile | string, params: Params.ISendVideoNoteParams): Promise<MessageContext>;

  public replyWithVideoNote(videoNote: string, params: Params.ISendVideoNoteParams): Promise<MessageContext>;

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

  public replyWithVoice(voice: string, params: Params.ISendVoiceParams): Promise<MessageContext>;

  /**
   * Use this method to send a group of photos or videos as an album.
   * 
   * On success, an `Array<Message>` is returned.
   */
  public sendMediaGroup(mediaGroup: Interfaces.IInputFile | string, params: Params.ISendMediaGroupParams): Promise<MessageContext>;

  public replyWithMediaGroup(mediaGroup: string, params: Params.ISendMediaGroupParams): Promise<MessageContext>;

  /**
   * Use this method to send point on the map.
   * 
   * On success, the sent `Message` is returned.
   */
  public sendLocation(location: string, params: Params.ISendLocationParams): Promise<MessageContext>;

  public replyWithLocation(location: string, params: Params.ISendLocationParams): Promise<MessageContext>;

  /**
   * Use this method to send information about a venue.
   * 
   * On success, the sent `Message` is returned.
   */
  public sendVenue(venue: string, params: Params.ISendVenueParams): Promise<MessageContext>;

  public replyWithVenue(venue: string, params: Params.ISendVenueParams): Promise<MessageContext>;

  /**
   * Use this method to send phone contacts.
   * 
   * On success, the sent `Message` is returned.
   */
  public sendContact(contact: string, params: Params.ISendContactParams): Promise<MessageContext>;

  public replyWithContact(contact: string, params: Params.ISendContactParams): Promise<MessageContext>;

  /**
   * Use this method to send a native poll.
   * 
   * On success, the sent `Message` is returned.
   */
  public sendPoll(poll: string, params: Params.ISendPollParams): Promise<MessageContext>;

  public replyWithPoll(poll: string, params: Params.ISendPollParams): Promise<MessageContext>;

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
  public sendChatAction(action: Types.ChatActions, params: Params.ISendChatActionParams): Promise<true>;

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

export = ChannelPost;
