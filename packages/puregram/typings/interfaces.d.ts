import Types from './types';

/**
 * This object represents a Telegram user or bot.
 */
export interface IUser {
  /**
   * Unique identifier for this user or bot
   */
  id: number;

  /**
   * True, if this user is a bot
   */
  isBot: boolean;

  /**
   * User‘s or bot’s first name
   */
  firstName: string;

  /**
   * User‘s or bot’s last name
   */
  lastName?: string;

  /**
   * User‘s or bot’s username
   */
  username?: string;

  /**
   * [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) of the user's language
   */
  languageCode?: string;
}

/**
 * This object represents a chat.
 */
export interface IChat {
  /**
   * Unique identifier for this chat.
   * This number may be greater than 32 bits and some
   * programming languages may have difficulty/silent
   * defects in interpreting it. But it is smaller
   * than 52 bits, so a signed 64 bit integer or
   * double-precision float type are safe for storing
   * this identifier.
   */
  id: number;

  /**
   * Type of chat, can be either `private`, `group`, `supergroup` or `channel`
   */
  type: Types.ChatTypes;

  /**
   * Title, for supergroups, channels and group chats
   */
  title?: string;

  /**
   * Username, for private chats, supergroups and channels if available
   */
  username?: string;

  /**
   * First name of the other party in a private chat
   */
  firstName?: string;

  /**
   * Last name of the other party in a private chat
   */
  lastName?: string;

  /**
   * Chat photo. Returned only in `getChat`.
   */
  photo?: IChatPhoto;

  /**
   * Description, for groups, supergroups and channel chats.
   * Returned only in `getChat`.
   */
  description?: string;

  /**
   * Chat invite link, for groups, supergroups and channel chats.
   * Each administrator in a chat generates their own invite links,
   * so the bot must first generate the link using
   * exportChatInviteLink. Returned only in `getChat`.
   */
  inviteLink?: string;

  /**
   * Pinned message, for groups, supergroups and channels.
   * Returned only in `getChat`.
   */
  pinnedMessage?: IMessage;

  /**
   * Default chat member permissions, for groups and supergroups.
   * Returned only in `getChat`.
   */
  permissions?: ChatPermissions;

  /**
   * For supergroups, name of group sticker set.
   * Returned only in `getChat`.
   */
  stickerSetName?: string;

  /**
   * True, if the bot can change the group sticker set.
   * Returned only in `getChat`.
   */
  canSetStickerSet?: boolean;
}

/**
 * This object represents a message.
 */
export interface IMessage {
  /**
   * Unique message identifier inside this chat
   */
  id: number;

  /**
   * Sender, empty for messages sent to channels
   */
  from?: IUser;

  /**
   * Date the message was sent in Unix time
   */
  date: number;

  /**
   * Conversation the message belongs to
   */
  chat: IChat;

  /**
   * For forwarded messages,
   * sender of the original message
   */
  forwardFrom?: IUser;

  /**
   * For messages forwarded from channels,
   * information about the original channel
   */
  forwardFromChat?: IChat;

  /**
   * For messages forwarded from channels,
   * identifier of the original message in the channel
   */
  forwardFromMessageId?: number;
  
  /**
   * For messages forwarded from channels,
   * signature of the post author if present
   */
  forwardSignature?: string;

  /**
   * Sender's name for messages forwarded from
   * users who disallow adding a link to their
   * account in forwarded messages
   */
  forwardSenderSame?: string;

  /**
   * For forwarded messages,
   * date the original message was sent in Unix time
   */
  forwardDate?: number;

  /**
   * For replies, the original message.
   * Note that the Message object in this field
   * will not contain further reply_to_message
   * fields even if it itself is a reply.
   */
  replyMessage?: IMessage;

  /**
   * Date the message was last edited in Unix time
   */
  editDate?: number;

  /**
   * The unique identifier of a media message group
   * this message belongs to
   */
  mediaGroupId?: string;

  /**
   * Signature of the post author for messages in channels
   */
  authorSignature?: string;

  /**
   * For text messages, the actual UTF-8 text of the message, 0-4096 characters.
   */
  text?: string;

  /**
   * For text messages, special entities like usernames,
   * URLs, bot commands, etc. that appear in the text
   */
  entities?: Array<IMessageEntity>;

  /**
   * For messages with a caption, special entities like usernames,
   * URLs, bot commands, etc. that appear in the caption
   */
  captionEntities?: Array<IMessageEntity>;

  /**
   * New members that were added to the group or supergroup
   * and information about them
   * (the bot itself may be one of these members)
   */
  newChatMembers?: Array<IUser>;

  /**
   * A member was removed from the group,
   * information about them
   * (this member may be the bot itself)
   */
  leftChatMember?: IUser;

  /**
   * A chat title was changed to this value
   */
  newChatTitle?: string;

  /**
   * A chat photo was change to this value
   */
  newChatPhoto?: Array<IPhotoSize>;

  /**
   * Service message: the chat photo was deleted
   */
  deleteChatPhoto?: true;

  /**
   * Service message: the group has been created
   */
  groupChatCreated?: true;

  /**
   * Service message: the supergroup has been created.
   * This field can‘t be received in a message coming
   * through updates, because bot can’t be a member of
   * a supergroup when it is created.
   * It can only be found in reply_to_message if someone
   * replies to a very first message in a directly
   * created supergroup.
   */
  supergroupChatCreated?: true;

  /**
   * Service message: the channel has been created.
   * This field can‘t be received in a message coming
   * through updates, because bot can’t be a member of
   * a channel when it is created.
   * It can only be found in reply_to_message if someone
   * replies to a very first message in a channel.
   */
  channelChatCreated?: true;

  /**
   * The group has been migrated to a supergroup with
   * the specified identifier.
   * This number may be greater than 32 bits and some
   * programming languages may have difficulty/silent
   * defects in interpreting it. But it is smaller
   * than 52 bits, so a signed 64 bit integer or
   * double-precision float type are safe for
   * storing this identifier.
   */
  migrateToChatId?: number;

  /**
   * The supergroup has been migrated from a group with
   * the specified identifier.
   * This number may be greater than 32 bits and some
   * programming languages may have difficulty/silent
   * defects in interpreting it. But it is smaller
   * than 52 bits, so a signed 64 bit integer or
   * double-precision float type are safe for
   * storing this identifier.
   */
  migrateFromChatId?: number;

  /**
   * Specified message was pinned.
   * Note that the Message object in this field will not
   * contain further reply_to_message fields
   * even if it is itself a reply.
   */
  pinnedMessage?: IMessage;

  /**
   * Message is an invoice for a [payment](https://core.telegram.org/bots/api#payments),
   * information about the invoice.
   * [More about payments](https://core.telegram.org/bots/api#payments)
   */
  invoice?: IInvoice;

  /**
   * Message is a service message about a successful payment,
   * information about the payment.
   * [More about payments](https://core.telegram.org/bots/api#payments)
   */
  successfulPayment?: ISuccessfulPayment;

  /**
   * The domain name of the website on which the user has logged in.
   * [More about Telegram Login](https://core.telegram.org/widgets/login)
   */
  connectedWebsite?: string;

  /**
   * Telegram Passport data
   */
  passportData?: IPassportData;

  /**
   * Inline keyboard attached to the message.
   * 
   * `login_url` buttons are represented as ordinary `url` buttons.
   */
  replyMarkup?: IInlineKeyboardMarkup;
}

/**
 * This object represents one special entity in a text message.
 * For example, hashtags, usernames, URLs, etc.
 */
export interface IMessageEntity {
  /**
   * Type of the entity.
   * 
   * Can be `mention` (`@username`), `hashtag`, `cashtag`,
   * `bot_command`, `url`, `email`, `phone_number`,
   * `bold` (bold text), `italic` (italic text),
   * `code` (monowidth string), p`re (monowidth block),
   * `text_link` (for clickable text URLs),
   * `text_mention` (for users without usernames)
   */
  type: Types.MessageEntityTypes;

  /**
   * Offset in UTF-16 code units to the start of the entity
   */
  offset: number;

  /**
   * Length of the entity in UTF-16 code units
   */
  length: number;

  /**
   * For `text_link` only,
   * url that will be opened after user taps on the text
   */
  url?: string;

  /**
   * For `text_mention` only,
   * the mentioned user
   */
  user?: IUser;
}

/**
 * This object represents one size of
 * a photo or a [file](https://core.telegram.org/bots/api#document) /
 * [sticker](https://core.telegram.org/bots/api#sticker) thumbnail.
 */
export interface IPhotoSize {
  /**
   * Identifier for this file
   */
  fileId: string;

  /**
   * Photo width
   */
  width: number;

  /**
   * Photo height
   */
  height: number;

  /**
   * File size
   */
  fileSize?: number;
}

/**
 * This object represents an audio file to be
 * treated as music by the Telegram clients.
 */
export interface IAudio {
  /**
   * Identifier for this file
   */
  fileId: string;

  /**
   * Duration of the audio in seconds as defined by sender
   */
  duration: number;

  /**
   * Performer of the audio as defined by sender or by audio tags
   */
  performer?: string;

  /**
   * Title of the audio as defined by sender or by audio tags
   */
  title?: string;

  /**
   * MIME type of the file as defined by sender
   */
  mimeType?: string;

  /**
   * File size
   */
  fileSize?: number;

  /**
   * Thumbnail of the album cover to which the music file belongs
   */
  thumb?: IPhotoSize;
}

/**
 * This object represents a general file
 * (as opposed to [photos](https://core.telegram.org/bots/api#photosize),
 * [voice messages](https://core.telegram.org/bots/api#voice)
 * and [audio files](https://core.telegram.org/bots/api#audio)).
 */
export interface IDocument {
  /**
   * Identifier for this file
   */
  fileId: string;

  /**
   * Document thumbnail as defined by sender
   */
  thumb?: IPhotoSize;

  /**
   * Original filename as defined by sender
   */
  fileName?: string;

  /**
   * MIME type of the file as defined by sender
   */
  mimeType?: string;

  /**
   * File size
   */
  fileSize?: number;
}

/**
 * This object represents a video file.
 */
export interface IVideo {
  /**
   * Identifier for this file
   */
  fileId: string;

  /**
   * Video width as defined by sender
   */
  width: number;

  /**
   * Video height as defined by sender
   */
  height: number;

  /**
   * Duration of the video in seconds as defined by sender
   */
  duration: number;

  /**
   * Video thumbnail
   */
  thumb?: IPhotoSize;

  /**
   * Mime type of a file as defined by sender
   */
  mimeType?: string;

  /**
   * File size
   */
  fileSize?: number;
}

/**
 * This object represents an animation file
 * (GIF or H.264/MPEG-4 AVC video without sound).
 */
export interface IAnimation {
  /**
   * Identifier for this file
   */
  fileId: string;

  /**
   * Video width as defined by sender
   */
  width: number;

  /**
   * Video height as defined by sender
   */
  height: number;

  /**
   * Duration of the video in seconds as defined by sender
   */
  duration: number;

  /**
   * Animation thumbnail as defined by sender
   */
  thumb?: IPhotoSize;

  /**
   * Original animation filename as defined by sender
   */
  fileName?: string;

  /**
   * MIME type of the file as defined by sender
   */
  mimeType?: string;

  /**
   * File size
   */
  fileSize?: number;
}

/**
 * This object represents a voice note.
 */
export interface IVoice {
  /**
   * Identifier for this file
   */
  fileId: string;

  /**
   * Duration of the audio in seconds as defined by sender
   */
  duration: number;

  /**
   * MIME type of the file as defined by sender
   */
  mimeType?: string;

  /**
   * File size
   */
  fileSize?: number;
}

/**
 * This object represents
 * a [video message](https://telegram.org/blog/video-messages-and-telescope).
 */
export interface IVideoNote {
  /**
   * Identifier for this file
   */
  fileId: string;

  /**
   * Video width and height (diameter of the video message)
   * as defined by sender
   */
  length: number;

  /**
   * Duration of the video in seconds as defined by sender
   */
  duration: number;

  /**
   * Video thumbnail
   */
  thumb?: IPhotoSize;

  /**
   * File size
   */
  fileSize?: number;
}

/**
 * This object represents a phone contact.
 */
export interface IContact {
  /**
   * Contact's phone number
   */
  phoneNumber: string;

  /**
   * Contact's first name
   */
  firstName: string;

  /**
   * Contact's last name
   */
  lastName?: string;

  /**
   * Contact's user identifier in Telegram
   */
  userId?: number;

  /**
   * Additional data about the contact in the form of
   * a [vCard](https://en.wikipedia.org/wiki/VCard)
   */
  vcard?: string;
}

/**
 * This object represents a point on the map.
 */
export interface ILocation {
  /**
   * Longitude as defined by sender
   */
  longitude: number;

  /**
   * Latitude as defined by sender
   */
  latitude: number;
}

/**
 * This object represents a venue.
 */
export interface IVenue {
  /**
   * Venue location
   */
  location: ILocation;

  /**
   * Name of the venue
   */
  title: string;

  /**
   * Address of the venue
   */
  address: string;

  /**
   * Foursquare identifier of the venue
   */
  foursquareId?: string;

  /**
   * Foursquare type of the venue.
   * (For example, `arts_entertainment/default`,
   * `arts_entertainment/aquarium` or `food/icecream`.)
   */
  foursquareType?: string;
}

/**
 * This object contains information
 * about one answer option in a poll.
 */
export interface IPollOption {
  /**
   * Option text, 1-100 characters
   */
  text: string;

  /**
   * Number of users that voted for this option
   */
  voterCount: number;
}

/**
 * This object contains information about a poll.
 */
export interface IPoll {
  /**
   * Unique poll identifier
   */
  id: string;

  /**
   * Poll question, 1-255 characters
   */
  question: string;

  /**
   * List of poll options
   */
  options: Array<IPollOption>;

  /**
   * True, if the poll is closed
   */
  isClosed: boolean;
}

/**
 * This object represent a user's profile pictures.
 */
export interface IUserProfilePhotos {
  /**
   * Total number of profile pictures the target user has
   */
  totalCount: number;

  /**
   * Requested profile pictures (in up to 4 sizes each)
   */
  photos: Array<Array<IPhotoSize>>;
}

/**
 * This object represents an incoming update.
 * 
 * At most **one** of the optional parameters can be present in any given update.
 */
export interface IUpdate {
  /**
   * The update‘s unique identifier.
   * Update identifiers start from a
   * certain positive number and increase
   * sequentially.
   * This ID becomes especially handy if
   * you’re using Webhooks,
   * since it allows you to ignore repeated
   * updates or to restore the correct update
   * sequence, should they get out of order.
   * If there are no new updates for at least a week,
   * then identifier of the next update will be
   * chosen randomly instead of sequentially.
   */
  update_id: number;

  /**
   * New incoming message of
   * any kind — text, photo, sticker, etc.
   */
  message?: IMessage;

  /**
   * New version of a message
   * that is known to the bot and was edited
   */
  edited_message?: IMessage;

  /**
   * New incoming channel post of
   * any kind — text, photo, sticker, etc.
   */
  channel_post?: IMessage;

  /**
   * New version of a channel post that is known to the
   * bot and was edited
   */
  edited_channel_post?: IMessage;

  /**
   * New incoming inline query
   */
  inline_query?: IInlineQuery;

  /**
   * The result of an inline query that was chosen by
   * a user and sent to their chat partner.
   */
  chosen_inline_result?: IChosenInlineResult;

  /**
   * New incoming callback query
   */
  callback_query?: ICallbackQuery;

  /**
   * New incoming shipping query.
   * Only for invoices with flexible price
   */
  shipping_query?: IShippingQuery;

  /**
   * New incoming pre-checkout query.
   * Contains full information about checkout
   */
  pre_checkout_query?: IPreCheckoutQuery;

  /**
   * New poll state.
   * Bots receive only updates about
   * stopped polls and polls,
   * which are sent by the bot
   */
  poll?: IPoll;
}
