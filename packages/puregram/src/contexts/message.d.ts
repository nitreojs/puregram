import Params from '../../typings/params';
import Types from '../../typings/types';
import Interfaces from '../../typings/interfaces';

import Context from './context';

type Attachment =
  | Interfaces.IAudio
  | Interfaces.IDocument
  | Interfaces.IAnimation
  | Interfaces.IGame
  | Interfaces.PhotoAttachment
  | Interfaces.ISticker
  | Interfaces.IVideo
  | Interfaces.IVoice
  | Interfaces.IVideoNote
  | Interfaces.IContact
  | Interfaces.ILocation
  | Interfaces.IVenue
  | Interfaces.IPoll;

type MessageOrTrue = MessageContext | true;

declare class MessageContext extends Context {
  public constructor(telegram: Params.ITelegramParams, update: object);

  /**
   * Unique message identifier inside this chat
   */
  public id: number;

  /**
   * Sender, empty for messages sent to channels
   */
  public from: Interfaces.IUser;

  /**
   * Sender's unique id
   */
  public senderId: number;

  /**
   * Is message sent by bot?
   */
  public isOutbox: boolean;

  /**
   * Date the message was sent in Unix time
   */
  public date: number;

  /**
   * Conversation the message belongs to
   */
  public chat: Interfaces.IChat;

  /**
   * Chat's id
   */
  public chatId: number;

  /**
   * Chat's type
   */
  public chatType: Types.ChatTypes;

  /**
   * For forwarded messages, sender of the original message
   */
  public forwardFrom?: Interfaces.IUser;

  /**
   * For messages forwarded from channels, information about the original channel
   */
  public forwardFromChat?: Interfaces.IUser;

  /**
   * For messages forwarded from channels, identifier of the original message in the channel
   */
  public forwardFromMessageId?: number;

  /**
   * For messages forwarded from channels, signature of the post author if present
   */
  public forwardSignature?: string;

  /**
   * Sender's name for messages forwarded from users
   * who disallow adding a link to their account in forwarded messages
   */
  public forwardSenderName?: string;

  /**
   * For forwarded messages, date the original message was sent in Unix time
   */
  public forwardDate?: number;

  /**
   * Is message a forwarded one?
   */
  public isForward: boolean;

  /**
   * For replies, the original message.
   * Note that the Message object in this field will not contain further
   * `reply_to_message` fields even if it itself is a reply.
   */
  public replyMessage?: Interfaces.IMessage;

  /**
   * Date the message was last edited in Unix time
   */
  public editDate?: number;

  /**
   * The unique identifier of a media message group this message belongs to
   */
  public mediaGroupId?: string;

  /**
   * Signature of the post author for messages in channels
   */
  public authorSignature?: string;

  /**
   * For text messages, the actual UTF-8 text of the message, 0-4096 characters
   */
  public text?: string;

  /**
   * [Deep-linking](https://core.telegram.org/bots#deep-linking) payload
   */
  public startPayload?: string | number | object;

  /**
   * For text messages, special entities like usernames,
   * URLs, bot commands, etc. that appear in the text
   */
  public entities?: Array<Interfaces.IMessageEntity>;

  /**
   * Does message have any entities?
   */
  public hasEntities: boolean;

  /**
   * For messages with a caption, special entities like usernames,
   * URLs, bot commands, etc. that appear in the caption
   */
  public captionEntities?: Array<Interfaces.IMessageEntity>;

  /**
   * Message is an audio file, information about the file
   */
  public audio?: Interfaces.IAudio;

  /**
   * Message is a general file, information about the file
   */
  public document?: Interfaces.IDocument;

  /**
   * Message is an animation, information about the animation.
   * For backward compatibility, when this field is set, the `document` field will also be set
   */
  public animation?: Interfaces.IAnimation;

  /**
   * Message is a game, information about the game
   */
  public game?: Interfaces.IGame;

  /**
   * Message is a photo, available sizes of the photo
   */
  public photo?: Interfaces.PhotoAttachment;

  /**
   * Message is a sticker, information about the sticker
   */
  public sticker?: Interfaces.ISticker;

  /**
   * Message is a video, information about the video
   */
  public video?: Interfaces.IVideo;

  /**
   * Message is a voice message, information about the file
   */
  public voice?: Interfaces.IVoice;

  /**
   * Message is a video note, information about the video message
   */
  public videoNote?: Interfaces.IVideoNote;

  /**
   * Caption for the animation, audio, document, photo, video or voice, 0-1024 characters
   */
  public caption?: string;

  /**
   * Message is a shared contact, information about the contact
   */
  public contact?: Interfaces.IContact;

  /**
   * Message is a shared location, information about the location
   */
  public location?: Interfaces.ILocation;

  /**
   * Message is a venue, information about the venue
   */
  public venue?: Interfaces.IVenue;

  /**
   * Message is a native poll, information about the poll
   */
  public poll?: Interfaces.IPoll;

  /**
   * Message is a dice with random value from `1` to `6`
   */
  public dice?: Interfaces.IDice;

  /**
   *
   */
  public attachments: Array<Attachment>;

  /**
   * Checks for the presence of attachments
   */
  public hasAttachments(type?: Types.AttachmentTypes): boolean;

  /**
   * Returns the attachments
   */
  public getAttachments(type: 'audio'): Array<Interfaces.IAudio>;

  public getAttachments(type: 'document'): Array<Interfaces.IDocument>;

  public getAttachments(type: 'animation'): Array<Interfaces.IAnimation>;

  public getAttachments(type: 'game'): Array<Interfaces.IGame>;

  public getAttachments(type: 'photo'): Interfaces.PhotoAttachment;

  public getAttachments(type: 'sticker'): Array<Interfaces.ISticker>;

  public getAttachments(type: 'video'): Array<Interfaces.IVideo>;

  public getAttachments(type: 'voice'): Array<Interfaces.IVoice>;

  public getAttachments(type: 'video_note' | 'videoNote'): Array<Interfaces.IVideoNote>;

  public getAttachments(type: 'contact'): Array<Interfaces.IContact>;

  public getAttachments(type: 'location'): Array<Interfaces.ILocation>;

  public getAttachments(type: 'venue'): Array<Interfaces.IVenue>;

  public getAttachments(type: 'poll'): Array<Interfaces.IPoll>;

  public getAttachments(type?: Types.AttachmentTypes): boolean;

  /**
   * New members that were added to the group or supergroup
   * and information about them (the bot itself may be one of these members)
   */
  public newChatMembers?: Array<Interfaces.IUser>;

  /**
   * A member was removed from the group,
   * information about them (this member may be the bot itself)
   */
  public leftChatMember?: Interfaces.IUser;

  /**
   * A chat title was changed to this value
   */
  public newChatTitle?: string;

  /**
   * A chat photo was change to this value
   */
  public newChatPhoto?: Interfaces.PhotoAttachment;

  /**
   * Service message: the chat photo was deleted
   */
  public deleteChatPhoto?: true;

  /**
   * Service message: the group has been created
   */
  public groupChatCreated?: true;

  /**
   * Service message: the supergroup has been created.
   * This field can‘t be received in a message coming through updates,
   * because bot can’t be a member of a supergroup when it is created.
   * It can only be found in `reply_to_message` if someone replies to
   * a very first message in a directly created supergroup.
   */
  public supergroupChatCreated?: true;

  /**
   * Service message: the channel has been created.
   * This field can‘t be received in a message coming through updates,
   * because bot can’t be a member of a channel when it is created.
   * It can only be found in `reply_to_message` if someone replies to
   * a very first message in a channel.
   */
  public channelChatCreated?: true;

  /**
   * The group has been migrated to a supergroup with the specified identifier.
   * This number may be greater than 32 bits and some programming languages
   * may have difficulty/silent defects in interpreting it.
   * But it is smaller than 52 bits,
   * so a signed 64 bit integer or double-precision float type are
   * safe for storing this identifier.
   */
  public migrateToChatId?: number;

  /**
   * The supergroup has been migrated from a group with the specified identifier.
   * This number may be greater than 32 bits and some programming languages
   * may have difficulty/silent defects in interpreting it.
   * But it is smaller than 52 bits, so a signed 64 bit integer or
   * double-precision float type are safe for storing this identifier.
   */
  public migrateFromChatId?: number;

  /**
   * Specified message was pinned.
   * Note that the `Message` object in this field will not contain further
   * `reply_to_message` fields even if it is itself a reply.
   */
  public pinnedMessage?: Interfaces.IMessage;

  /**
   * Message is an invoice for a payment, information about the invoice
   */
  public invoice?: Interfaces.IInvoice;

  /**
   * Message is a service message about a successful payment,
   * information about the payment
   */
  public successfulPayment?: Interfaces.ISuccessfulPayment;

  /**
   * The domain name of the website on which the user has logged in
   */
  public connectedWebsite?: string;

  /**
   * Telegram Passport data
   */
  public passportData?: Interfaces.IPassportData;

  /**
   * Inline keyboard attached to the message.
   * `login_url` buttons are represented as ordinary `url` buttons.
   */
  public replyMarkup?: Interfaces.IInlineKeyboardMarkup;

  /**
   * Is this an event?
   */
  public isEvent: boolean;

  /**
   * Event type
   */
  public eventType?: string;

  /**
   * Does the message have text?
   */
  public hasText: boolean;

  /**
   * Does the message have forward messages?
   */
  public hasForward: boolean;

  /**
   * Is this message sent to the private messages?
   */
  public isPM: boolean;

  /**
   * Is this message sent to the group?
   */
  public isGroup: boolean;

  /**
   * Is this message sent to the channel?
   */
  public isChannel: boolean;

  /**
   * Is this message sent to the supergroup?
   */
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

  public replyWithVideoNote(videoNote: Interfaces.IInputFile | string, params: Params.ISendVideoNoteParams): Promise<MessageContext>;

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

  public replyWithMediaGroup(media: Interfaces.IInputFile | string, params: Params.ISendMediaGroupParams): Promise<MessageContext>;

  /**
   * Use this method to send point on the map.
   *
   * On success, the sent `Message` is returned.
   */
  public sendLocation(location: Params.ISendLocationParams, params?: Params.ISendLocationParams): Promise<MessageContext>;

  public replyWithLocation(location: Params.ISendLocationParams, params: Params.ISendLocationParams): Promise<MessageContext>;

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
   * Use this method to get a list of profile pictures for a user.
   *
   * Returns a `UserProfilePhotos` object.
   */
  public getUserProfilePhotos(params?: Params.IGetUserProfilePhotosParams): Promise<Interfaces.IUserProfilePhotos>;

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

export = MessageContext;
