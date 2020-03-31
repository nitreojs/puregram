import Types from './types';
import Interfaces from './interfaces';

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

  /**
   * True, if the bot can be invited to groups.
   * 
   * Returned only in `getMe`.
   */
  canJoinGroups?: boolean;

  /**
   * True, if privacy mode is disabled for the bot.
   * 
   * Returned only in `getMe`.
   */
  canReadAllGroupMessages?: boolean;

  /**
   * True, if the bot supports inline queries.
   * 
   * Returned only in `getMe`.
   */
  supportsInlineQueries?: boolean;
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
   * Chat photo.
   * 
   * Returned only in `getChat`.
   */
  photo?: IChatPhoto;

  /**
   * Description, for groups, supergroups and channel chats.
   * 
   * Returned only in `getChat`.
   */
  description?: string;

  /**
   * Chat invite link, for groups, supergroups and channel chats.
   * Each administrator in a chat generates their own invite links,
   * so the bot must first generate the link using
   * exportChatInviteLink.
   * 
   * Returned only in `getChat`.
   */
  inviteLink?: string;

  /**
   * Pinned message, for groups, supergroups and channels.
   * 
   * Returned only in `getChat`.
   */
  pinnedMessage?: IMessage;

  /**
   * Default chat member permissions, for groups and supergroups.
   * 
   * Returned only in `getChat`.
   */
  permissions?: IChatPermissions;

  /**
   * For supergroups,
   * the minimum allowed delay between consecutive messages
   * sent by each unpriviledged user.
   * 
   * Returned only in `getChat`.
   */
  slowModeDelay?: number;

  /**
   * For supergroups, name of group sticker set.
   * 
   * Returned only in `getChat`.
   */
  stickerSetName?: string;

  /**
   * True, if the bot can change the group sticker set.
   * 
   * Returned only in `getChat`.
   */
  canSetStickerSet?: boolean;
}

/**
 * Describes actions that a non-administrator user is allowed to take in a chat.
 */
export interface IChatPermissions {
  /**
   * `True`, if the user is allowed to send text messages,
   * contacts, locations and venues
   */
  can_send_messages?: boolean;

  /**
   * `True`, if the user is allowed to send audios, documents,
   * photos, videos, video notes and voice notes,
   * implies `can_send_messages`
   */
  can_send_media_messages?: boolean;

  /**
   * `True`, if the user is allowed to send polls,
   * implies `can_send_messages`
   */
  can_send_polls?: boolean;

  /**
   * `True`, if the user is allowed to send animations, games,
   * stickers and use inline bots,
   * implies `can_send_media_messages`
   */
  can_send_other_messages?: boolean;

  /**
   * `True`, if the user is allowed to add web page previews to their messages,
   * implies `can_send_media_messages`
   */
  can_add_web_page_previews?: boolean;

  /**
   * `True`, if the user is allowed to change the chat title, photo and other settings.
   * 
   * Ignored in public supergroups
   */
  can_change_info?: boolean;

  /**
   * `True`, if the user is allowed to invite new users to the chat
   */
  can_invite_users?: boolean;

  /**
   * `True`, if the user is allowed to pin messages.
   * 
   * Ignored in public supergroups
   */
  can_pin_messages?: boolean;
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
 * This object represents an
 * [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating)
 * that appears right next to the message it belongs to.
 */
export interface IInlineKeyboardMarkup {
  /**
   * Array of button rows, each represented by an `Array<InlineKeyboardButton>` objects
   */
  inline_keyboard: Array<Array<IInlineKeyboardButton>>;
}

/**
 * A placeholder, currently holds no information.
 * Use BotFather to set up your game.
 */
export interface ICallbackGame {

}

/**
 * This object represents one button of an inline keyboard.
 * 
 * You **must** use exactly one of the optional fields.
 */
interface IInlineKeyboardButton {
  /**
   * Label text on the button
   */
  text: string;

  /**
   * HTTP or tg:// url to be opened when button is pressed
   */
  url?: string;

  /**
   * An HTTP URL used to automatically authorize the user.
   */
  login_url?: ILoginUrl;

  /**
   * Data to be sent in a callback query to the bot when button is pressed, 1-64 bytes
   */
  callback_data?: string;

  /**
   * If set, pressing the button will prompt the user to select one of their chats,
   * open that chat and insert the bot‘s username and the specified inline query
   * in the input field. Can be empty, in which case just the bot’s username
   * will be inserted.
   */
  switch_inline_query?: string;

  /**
   * If set, pressing the button will insert the bot‘s username and the specified
   * inline query in the current chat's input field. Can be empty, in which case
   * only the bot’s username will be inserted.
   */
  switch_inline_query_current_chat?: string;

  /**
   * Description of the game that will be launched when the user presses the button.
   */
  callback_game?: ICallbackGame;

  /**
   * Specify `true`, to send a Pay button.
   */
  pay?: boolean;
}

interface ITextButtonParams {
  text: string;

  params?: object;
}

interface IUrlButtonParams {
  text: string;

  url: string;

  payload?: object;
}

interface ISwitchToCurrentChatButtonParams {
  text: string;

  query: string;
}

interface ISwitchToChatButtonParams {
  text: string;

  query: string;
}

interface IGameButtonParams {
  game: ICallbackGame;

  text: string;
}

interface ILoginButtonParams {
  text: string;

  loginUrl: ILoginUrl;
}

interface ITextButton {
  text: string;

  callback_data?: string;
}

interface IUrlButton {
  text: string;

  url: string;

  callback_data?: string;
}

interface ISwitchToCurrentChatButton {
  text: string;

  switch_inline_query_current_chat: string;
}

interface ISwitchToChatButton {
  text: string;

  switch_inline_query: string;
}

interface IGameButton {
  text: string;

  game: ICallbackGame;
}

interface IPayButton {
  text: string;

  pay: true;
}

interface ILoginButton {
  text: string;

  login_url: ILoginUrl;
}

/**
 * This object represents a parameter of the inline keyboard button used to automatically authorize a user.
 * Serves as a great replacement for the Telegram Login Widget when the user is coming from Telegram.
 * All the user needs to do is tap/click a button and confirm that they want to log in.
 */
export interface ILoginUrl {
  /**
   * An HTTP URL to be opened with user authorization data added to the query string when the button is pressed.
   * If the user refuses to provide authorization data,
   * the original URL without information about the user will be opened.
   * The data added is the same as described in [Receiving authorization data](https://core.telegram.org/widgets/login#receiving-authorization-data).
   * 
   * **NOTE**: You **must** always check the hash of the received data to verify the authentication
   * and the integrity of the data as described in [Checking authorization](https://core.telegram.org/widgets/login#checking-authorization).
   */
  url: string;

  /**
   * New text of the button in forwarded messages.
   */
  forward_text?: string;

  /**
   * Username of a bot, which will be used for user authorization.
   * See [Setting up a bot](https://core.telegram.org/widgets/login#setting-up-a-bot) for more details.
   * If not specified, the current bot's username will be assumed.
   * The *url*'s domain must be the same as the domain linked with the bot.
   * See [Linking your domain to the bot](https://core.telegram.org/widgets/login#linking-your-domain-to-the-bot) for more details.
   */
  bot_username?: string;

  /**
   * Pass `True` to request the permission for your bot to send messages to the user.
   */
  request_write_access?: boolean;
}

/**
 * Contains information about Telegram Passport data
 * shared with the bot by the user.
 */
export interface IPassportData {
  /**
   * Array with information about documents and other Telegram Passport elements
   * that was shared with the bot
   */
  data: Array<IEncryptedPassportElement>;

  /**
   * Encrypted credentials required to decrypt the data
   */
  credentials: IEncryptedCredentials;
}

/**
 * Contains data required for decrypting and authenticating [EncryptedPassportElement](https://core.telegram.org/bots/api#encryptedpassportelement).
 * See the [Telegram Passport Documentation](https://core.telegram.org/passport#receiving-information)
 * for a complete description of the data decryption and authentication processes.
 */
export interface IEncryptedCredentials {
  /**
   * Base64-encoded encrypted JSON-serialized data with unique user's payload,
   * data hashes and secrets required for [EncryptedPassportElement](https://core.telegram.org/bots/api#encryptedpassportelement) decryption and authentication
   */
  data: string;

  /**
   * Base64-encoded data hash for data authentication
   */
  hash: string;

  /**
   * Base64-encoded secret, encrypted with the bot's public RSA key, required for data decryption
   */
  secret: string;
}

/**
 * Contains information about documents or other Telegram Passport elements
 * shared with the bot by the user.
 */
export interface IEncryptedPassportElement {
  /**
   * Element type.
   */
  type: Types.PassportElements;

  /**
   * Base64-encoded encrypted Telegram Passport element data provided by the user,
   * available for `personal_details`, `passport`, `driver_license`,
   * `identity_card`, `internal_passport` and `address` types
   * 
   * Can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api#encryptedcredentials).
   */
  data?: string;

  /**
   * User's verified phone number, available only for `phone_number` type
   */
  phone_number?: string;

  /**
   * User's verified email address, available only for `email` type
   */
  email?: string;

  /**
   * Array of encrypted files with documents provided by the user,
   * available for `utility_bill`, `bank_statement`, `rental_agreement`,
   * `passport_registration` and `temporary_registration` types.
   * 
   * Files can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api#encryptedcredentials).
   */
  files?: Array<IPassportFile>;

  /**
   * Encrypted file with the front side of the document, provided by the user.
   * Available for `passport`, `driver_license`, `identity_card` and `internal_passport`.
   * 
   * The file can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api#encryptedcredentials).
   */
  front_side?: IPassportFile;

  /**
   * Encrypted file with the reverse side of the document, provided by the user.
   * Available for `driver_license` and `identity_card`.
   * 
   * The file can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api#encryptedcredentials).
   */
  reverse_side?: IPassportFile;

  /**
   * Encrypted file with the selfie of the user holding a document, provided by the user;
   * available for `passport`, `driver_license`, `identity_card` and `internal_passport`.
   * 
   * The file can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api#encryptedcredentials).
   */
  selfie?: IPassportFile;

  /**
   * Array of encrypted files with translated versions of documents provided by the user.
   * Available if requested for `passport`, `driver_license`, `identity_card`, `internal_passport`,
   * `utility_bill`, `bank_statement`, `rental_agreement`, `passport_registration`
   * and `temporary_registration` types.
   * 
   * Files can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api#encryptedcredentials).
   */
  translation?: Array<IPassportFile>;

  /**
   * Base64-encoded element hash for using in [PassportElementErrorUnspecified](https://core.telegram.org/bots/api#passportelementerrorunspecified)
   */
  hash?: string;
}

/**
 * This object represents a file uploaded to Telegram Passport.
 * Currently all Telegram Passport files are in JPEG format
 * when decrypted and don't exceed 10MB.
 */
export interface IPassportFile {
  /**
   * Identifier for this file,
   * which can be used to download or reuse the file
   */
  file_id: string;

  /**
   * Unique identifier for this file,
   * which is supposed to be the same over time and for different bots.
   * Can't be used to download or reuse the file.
   */
  file_unique_id: string;

  /**
   * File size
   */
  file_size: number;

  /**
   * Unix time when the file was uploaded
   */
  file_date: number;
}

/**
 * This object contains basic information about a successful payment.
 */
export interface ISuccessfulPayment {
  /**
   * Three-letter ISO 4217
   * [currency](https://core.telegram.org/bots/payments#supported-currencies) code
   */
  currency: string;

  /**
   * Total price in the *smallest units* of the currency (integer, **not** float/double).
   * For example, for a price of `US$ 1.45` pass `amount = 145`.
   * See the exp parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json),
   * it shows the number of digits past the decimal point for each currency (2 for the majority of currencies).
   */
  total_amount: number;

  /**
   * Bot specified invoice payload
   */
  invoice_payload: string;

  /**
   * Identifier of the shipping option chosen by the user
   */
  shipping_option_id?: string;

  /**
   * Order info provided by the user
   */
  order_info?: IOrderInfo;

  /**
   * Telegram payment identifier
   */
  telegram_payment_charge_id: string;

  /**
   * Provider payment identifier
   */
  provider_payment_charge_id: string;
}

export interface IOrderInfo {
  /**
   * User name
   */
  name?: string;

  /**
   * User's phone number
   */
  phone_number?: string;

  /**
   * User email
   */
  email?: string;
  
  /**
   * User shipping address
   */
  shipping_address?: IShippingAddress;
}

/**
 * This object represents a shipping address.
 */
export interface IShippingAddress {
  /**
   * ISO 3166-1 alpha-2 country code
   */
  country_code: string;

  /**
   * State, if applicable
   */
  state: string;

  /**
   * City
   */
  city: string;

  /**
   * First line for the address
   */
  street_line1: string;

  /**
   * Second line for the address
   */
  street_line2: string;

  /**
   * Address post code
   */
  post_code: string;
}

/**
 * This object contains basic information about an invoice.
 */
export interface IInvoice {
  /**
   * Product name
   */
  title: string;

  /**
   * Product description
   */
  description: string;

  /**
   * Unique bot deep-linking parameter that can be used to generate this invoice
   */
  start_parameter: string;

  /**
   * Three-letter ISO 4217
   * [currency](https://core.telegram.org/bots/payments#supported-currencies) code
   */
  currency: string;

  /**
   * Total price in the *smallest units* of the currency (integer, **not** float/double).
   * For example, for a price of `US$ 1.45` pass `amount = 145`.
   * See the exp parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json),
   * it shows the number of digits past the decimal point for each currency (2 for the majority of currencies).
   */
  total_amount: number;
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
   * Unique identifier for this file,
   * which is supposed to be the same
   * over time and for different bots.
   * Can't be used to download or reuse the file.
   */
  fileUniqueId: string;

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
   * Unique identifier for this file,
   * which is supposed to be the same
   * over time and for different bots.
   * Can't be used to download or reuse the file.
   */
  fileUniqueId: string;

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
   * Unique identifier for this file,
   * which is supposed to be the same
   * over time and for different bots.
   * Can't be used to download or reuse the file.
   */
  fileUniqueId: string;

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
   * Unique identifier for this file,
   * which is supposed to be the same
   * over time and for different bots.
   * Can't be used to download or reuse the file.
   */
  fileUniqueId: string;

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
   * Unique identifier for this file,
   * which is supposed to be the same
   * over time and for different bots.
   * Can't be used to download or reuse the file.
   */
  fileUniqueId: string;

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
   * Unique identifier for this file,
   * which is supposed to be the same
   * over time and for different bots.
   * Can't be used to download or reuse the file.
   */
  fileUniqueId: string;

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
   * Unique identifier for this file,
   * which is supposed to be the same
   * over time and for different bots.
   * Can't be used to download or reuse the file.
   */
  fileUniqueId: string;

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
   * Total number of users that voted in the poll
   */
  totalVoterCount: number;

  /**
   * True, if the poll is closed
   */
  isClosed: boolean;

  /**
   * True, if the poll is anonymous
   */
  isAnonymous: boolean;

  /**
   * Poll type, currently can be `regular` or `quiz`
   */
  type: Types.PollTypes;

  /**
   * True, if the poll allows multiple answers
   */
  allowsMultipleAnswers: boolean;

  /**
   * 0-based identifier of the correct answer option.
   * Available only for polls in the quiz mode,
   * which are closed or was sent (not forwarded)
   * to the private chat with the bot.
   */
  correctOptionId?: number;
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

  /**
   * A user changed their answer
   * in a non-anonymous poll.
   * Bots receive new votes only
   * in polls that were sent by
   * the bot itself.
   */
  poll_answer?: IPollAnswer;
}

/**
 * This object contains information about an incoming pre-checkout query.
 */
export interface IPreCheckoutQuery {
  /**
   * Unique query identifier
   */
  id: string;

  /**
   * User who sent the query
   */
  from: IUser;

  /**
   * Three-letter ISO 4217
   * [currency](https://core.telegram.org/bots/payments#supported-currencies) code
   */
  currency: string;

  /**
   * Total price in the *smallest units* of the currency (integer, **not** float/double).
   * For example, for a price of `US$ 1.45` pass `amount = 145`.
   * See the exp parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json),
   * it shows the number of digits past the decimal point for each currency (2 for the majority of currencies).
   */
  total_amount: number;

  /**
   * Bot specified invoice payload
   */
  invoice_payload: string;

  /**
   * Identifier of the shipping option chosen by the user
   */
  shipping_option_id?: string;

  /**
   * Order info provided by the user
   */
  order_info?: IOrderInfo;
}

/**
 * This object contains information about an incoming shipping query.
 */
export interface IShippingQuery {
  /**
   * Unique query identifier
   */
  id: string;

  /**
   * User who sent the query
   */
  from: IUser;

  /**
   * Bot specified invoice payload
   */
  invoice_payload: string;

  /**
   * User specified shipping address
   */
  shipping_address: IShippingAddress;
}

/**
 * This object represents an incoming callback query from a callback button in an inline keyboard.
 * 
 * If the button that originated the query was attached to a message sent by the bot,
 * the field `message` will be present.
 * 
 * If the button was attached to a message sent via the bot (in inline mode),
 * the field `inline_message_id` will be present.
 * 
 * Exactly one of the fields `data` or `game_short_name` will be present.
 */
export interface ICallbackQuery {
  /**
   * Unique identifier for this query
   */
  id: string;

  /**
   * Sender
   */
  from: IUser;

  /**
   * Message with the callback button that originated the query.
   * Note that message content and message date
   * will not be available if the message is too old
   */
  message?: IMessage;

  /**
   * Identifier of the message sent via the bot in inline mode, that originated the query.
   */
  inline_message_id?: string;

  /**
   * Global identifier, uniquely corresponding to the chat to which the message with the callback button was sent.
   * Useful for high scores in games.
   */
  chat_instance: string;

  /**
   * Data associated with the callback button.
   * Be aware that a bad client can send arbitrary data in this field.
   */
  data?: string;

  /**
   * Short name of a `Game` to be returned,
   * serves as the unique identifier for the game
   */
  game_short_name?: string;
}

/**
 * This object represents an incoming inline query.
 * When the user sends an empty query,
 * your bot could return some default or trending results.
 */
export interface IInlineQuery {
  /**
   * Unique identifier for this query
   */
  id: string;

  /**
   * Sender
   */
  from: IUser;

  /**
   * Sender location, only for bots that request user location
   */
  location?: ILocation;

  /**
   * Text of the query (up to 256 characters)
   */
  query: string;

  /**
   * Offset of the results to be returned, can be controlled by the bot
   */
  offset: string;
}

/**
 * Represents a result of an inline query
 * that was chosen by the user and sent to their chat partner.
 */
export interface IChosenInlineResult {
  /**
   * The unique identifier for the result that was chosen
   */
  result_id: string;

  /**
   * Sender location, only for bots that require user location
   */
  from: IUser;

  /**
   * Sender location, only for bots that require user location
   */
  location?: ILocation;

  /**
   * Identifier of the sent inline message.
   * Available only if there is an inline keyboard attached to the message.
   * Will be also received in callback queries and can be used to edit the message.
   */
  inline_message_id?: string;

  /**
   * The query that was used to obtain the result
   */
  query: string;
}

export interface IPollAnswer {
  /**
   * Unique poll identifier
   */
  pollId: number;
  
  /**
   * The user, who changed the answer to the poll
   */
  user: IUser;

  /**
   * 0-based identifiers of answer options,
   * chosen by the user.
   * May be empty if the user retracted their vote.
   */
  optionIds: Array<number>;
}

/**
 * This object represents a chat photo.
 */
export interface IChatPhoto {
  /**
   * File identifier of small (160x160) chat photo.
   * This file_id can be used only for photo
   * download and only for as long as the photo is not changed.
   */
  small_file_id: string;

  /**
   * Unique file identifier of small (160x160) chat photo,
   * which is supposed to be the same over time and
   * for different bots.
   * Can't be used to download or reuse the file.
   */
  small_file_unique_id: string;

  /**
   * File identifier of big (640x640) chat photo.
   * This file_id can be used only for photo download
   * and only for as long as the photo is not changed.
   */
  big_file_id: string;

  /**
   * Unique file identifier of big (640x640) chat photo,
   * which is supposed to be the same over time and for
   * different bots.
   * Can't be used to download or reuse the file.
   */
  big_file_unique_id: string;
}

/**
 * This object represents the contents of a file to be uploaded.
 * Must be posted using `multipart/form-data` in the usual way that files are uploaded via the browser.
 */
export interface IInputFile {
  [key: string]: any;
}

/**
 * Represents a photo to be sent.
 */
export interface IInputMediaPhoto {
  /**
   * Type of the result, must be `photo`
   */
  type: 'photo';

  /**
   * File to send.
   * 
   * Pass a `file_id` to send a file that exists on the Telegram servers (recommended),
   * pass an HTTP URL for Telegram to get a file from the Internet,
   * or pass `attach://<file_attach_name>` to upload a new one using `multipart/form-data`
   * under `<file_attach_name>` name.
   */
  media: string;

  /**
   * Caption of the photo to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;
}

export interface IInputMediaVideo {
  /**
   * Type of the result, must be `video`
   */
  type: 'video';

  /**
   * File to send.
   * 
   * Pass a `file_id` to send a file that exists on the Telegram servers (recommended),
   * pass an HTTP URL for Telegram to get a file from the Internet,
   * or pass `attach://<file_attach_name>` to upload a new one using `multipart/form-data`
   * under `<file_attach_name>` name.
   */
  media: string;

  /**
   * Thumbnail of the file sent;
   * can be ignored if thumbnail generation for the file is supported server-side.
   * The thumbnail should be in JPEG format and less than 200 kB in size.
   * A thumbnail‘s width and height should not exceed 320.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can’t be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>` if the thumbnail was uploaded
   * using `multipart/form-data` under <file_attach_name>.
   */
  thumb?: Interfaces.IInputFile | string;

  /**
   * Caption of the video to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Video width
   */
  width?: number;

  /**
   * Video height
   */
  height?: number;

  /**
   * Video duration
   */
  duration?: number;

  /**
   * Pass `True`, if the uploaded video is suitable for streaming
   */
  supports_streaming?: boolean;
}

/**
 * This object represents a file ready to be downloaded.
 * 
 * The file can be downloaded via the link `https://api.telegram.org/file/bot<token>/<file_path>`.
 * It is guaranteed that the link will be valid for at least **1 hour**.
 * When the link expires, a new one can be requested by calling `getFile`.
 */
export interface IFile {
  /**
   * Identifier for this file, which can be used to download or reuse the file
   */
  file_id: string;

  /**
   * Unique identifier for this file,
   * which is supposed to be the same over time and for different bots.
   * Can't be used to download or reuse the file.
   */
  file_unique_id: string;

  /**
   * File size, if known
   */
  file_size?: number;

  /**
   * File path
   */
  file_path?: string;
}

/**
 * This object represents a bot command.
 */
export interface IBotCommand {
  /**
   * Text of the command, 1-32 characters.
   * Can contain only lowercase English letters, digits and underscores.
   */
  command: string;

  /**
   * Description of the command, 3-256 characters.
   */
  description: string;
}

/**
 * Contains information about why a request was unsuccessful.
 */
export interface IResponseParameters {
  /**
   * The group has been migrated to a supergroup with the specified identifier.
   * This number may be greater than 32 bits and some programming languages
   * may have difficulty/silent defects in interpreting it.
   * But it is smaller than 52 bits, so a signed 64 bit integer or double-precision
   * float type are safe for storing this identifier.
   */
  migrate_to_chat_id?: number;

  /**
   * In case of exceeding flood control, the number of seconds left to wait before the request can be repeated
   */
  retry_after?: number;
}

/**
 * Represents an audio file to be treated as music to be sent.
 */
export interface IInputMediaAudio {
  /**
   * Type of the result, must be `audio`
   */
  type: 'audio';

  /**
   * File to send.
   * 
   * Pass a `file_id` to send a file that exists on the Telegram servers (recommended),
   * pass an HTTP URL for Telegram to get a file from the Internet,
   * or pass `attach://<file_attach_name>` to upload a new one using `multipart/form-data`
   * under `<file_attach_name>` name.
   */
  media: string;

  /**
   * Thumbnail of the file sent;
   * can be ignored if thumbnail generation for the file is supported server-side.
   * The thumbnail should be in JPEG format and less than 200 kB in size.
   * A thumbnail‘s width and height should not exceed 320.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can’t be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>` if the thumbnail was uploaded
   * using `multipart/form-data` under <file_attach_name>.
   */
  thumb?: Interfaces.IInputFile | string;

  /**
   * Caption of the audio to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Duration of the audio in seconds
   */
  duration?: number;

  /**
   * Performer of the audio
   */
  performer: string;

  /**
   * Title of the audio
   */
  title: string;
}

/**
 * Represents an animation file (GIF or H.264/MPEG-4 AVC video without sound) to be sent.
 */
export interface IInputMediaAnimation {
  /**
   * Type of the result, must be `animation`
   */
  type: 'animation';

  /**
   * File to send.
   * 
   * Pass a `file_id` to send a file that exists on the Telegram servers (recommended),
   * pass an HTTP URL for Telegram to get a file from the Internet,
   * or pass `attach://<file_attach_name>` to upload a new one using `multipart/form-data`
   * under `<file_attach_name>` name.
   */
  media: string;

  /**
   * Thumbnail of the file sent;
   * can be ignored if thumbnail generation for the file is supported server-side.
   * The thumbnail should be in JPEG format and less than 200 kB in size.
   * A thumbnail‘s width and height should not exceed 320.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can’t be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>` if the thumbnail was uploaded
   * using `multipart/form-data` under <file_attach_name>.
   */
  thumb?: Interfaces.IInputFile | string;

  /**
   * Caption of the animation to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Animation width
   */
  width?: number;

  /**
   * Animation height
   */
  height?: number;

  /**
   * Animation duration
   */
  duration?: number;
}

/**
 * Represents a general file to be sent.
 */
export interface IInputMediaDocument {
  /**
   * Type of the result, must be `document`
   */
  type: 'document';

  /**
   * File to send.
   * 
   * Pass a `file_id` to send a file that exists on the Telegram servers (recommended),
   * pass an HTTP URL for Telegram to get a file from the Internet,
   * or pass `attach://<file_attach_name>` to upload a new one using `multipart/form-data`
   * under `<file_attach_name>` name.
   */
  media: string;

  /**
   * Thumbnail of the file sent;
   * can be ignored if thumbnail generation for the file is supported server-side.
   * The thumbnail should be in JPEG format and less than 200 kB in size.
   * A thumbnail‘s width and height should not exceed 320.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can’t be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>` if the thumbnail was uploaded
   * using `multipart/form-data` under <file_attach_name>.
   */
  thumb?: Interfaces.IInputFile | string;

  /**
   * Caption of the document to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;
}

export interface IStickerSet {
  /**
   * Sticker set name
   */
  name: string;

  /**
   * Sticker set title
   */
  title: string;

  /**
   * `True`, if the sticker set contains animated stickers
   */
  is_animated: boolean;

  /**
   * `True`, if the sticker set contains masks
   */
  contains_masks: boolean;

  /**
   * List of all set stickers
   */
  stickers: Array<ISticker>;

  /**
   * Sticker set thumbnail in the .WEBP or .TGS format
   */
  thumb?: IPhotoSize;
}

/**
 * This object represents a sticker set.
 */
export interface ISticker {
  /**
   * Identifier for this file, which can be used to download or reuse the file
   */
  file_id: string;

  /**
   * Unique identifier for this file, which is supposed to be the same over time and for different bots.
   * Can't be used to download or reuse the file.
   */
  file_unique_id: string;

  /**
   * Sticker width
   */
  width: number;

  /**
   * Sticker height
   */
  height: number;

  /**
   * `True`, if the sticker is animated
   */
  is_animated: boolean;

  /**
   * Sticker thumbnail in the .WEBP or .JPG format
   */
  thumb?: IPhotoSize;

  /**
   * Emoji associated with the sticker
   */
  emoji?: string;

  /**
   * Name of the sticker set to which the sticker belongs
   */
  set_name?: string;

  /**
   * For mask stickers, the position where the mask should be placed
   */
  mask_position?: IMaskPosition;

  /**
   * File size
   */
  file_size?: number;
}

/**
 * This object describes the position on faces where a mask should be placed by default.
 */
export interface IMaskPosition {
  /**
   * The part of the face relative to which the mask should be placed.
   * 
   * One of `forehead`, `eyes`, `mouth`, or `chin`.
   */
  point: Types.MaskPositions;

  /**
   * Shift by X-axis measured in widths of the mask scaled to the face size, from left to right.
   * For example, choosing -1.0 will place mask just to the left of the default mask position.
   */
  x_shift: number;

  /**
   * Shift by Y-axis measured in heights of the mask scaled to the face size, from top to bottom.
   * For example, 1.0 will place the mask just below the default mask position.
   */
  y_shift: number;

  /**
   * Mask scaling coefficient.
   * For example, 2.0 means double size.
   */
  scale: number;
}

/**
 * This object represents one shipping option.
 */
export interface IShippingOption {
  /**
   * Shipping option identifier
   */
  id: string;

  /**
   * Option title
   */
  title: string;

  /**
   * List of price portions
   */
  prices: Array<ILabeledPrice>;
}

/**
 * This object represents a portion of the price for goods or services.
 */
export interface ILabeledPrice {
  /**
   * Portion label
   */
  label: string;

  /**
   * Price of the product in the *smallest units* of the currency (integer, **not** float/double).
   * For example, for a price of `US$ 1.45` pass `amount = 145`.
   * See the exp parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json),
   * it shows the number of digits past the decimal point for each currency (2 for the majority of currencies).
   */
  amount: number;
}

/**
 * This object represents an error in the Telegram Passport element
 * which was submitted that should be resolved by the user.
 */
export type PassportElementError =
| IPassportElementErrorDataField
| IPassportElementErrorFrontSide
| IPassportElementErrorReverseSide
| IPassportElementErrorSelfie
| IPassportElementErrorFile
| IPassportElementErrorFiles
| IPassportElementErrorTranslationFile
| IPassportElementErrorTranslationFiles
| IPassportElementErrorUnspecified;

/**
 * Represents an issue in one of the data fields that was provided by the user.
 * The error is considered resolved when the field's value changes.
 */
export interface IPassportElementErrorDataField {
  /**
   * Error source, must be `data`
   */
  source: 'data';

  /**
   * The section of the user's Telegram Passport which has the error,
   * one of `personal_details`, `passport`, `driver_license`, `identity_card`,
   * `internal_passport`, `address`
   */
  type: Types.PassportElementDataErrors;

  /**
   * Name of the data field which has the error
   */
  field_name: string;

  /**
   * Base64-encoded data hash
   */
  data_hash: string;

  /**
   * Error message
   */
  message: string;
}

/**
 * Represents an issue with the front side of a document.
 * The error is considered resolved when the file with the front side of the document changes.
 */
export interface IPassportElementErrorFrontSide {
  /**
   * Error source, must be `front_side`
   */
  source: 'front_side';

  /**
   * The section of the user's Telegram Passport which has the issue,
   * one of `passport`, `driver_license`, `identity_card`, `internal_passport`
   */
  type: Types.PassportElementFrontSideErrors;

  /**
   * Base64-encoded hash of the file with the front side of the document
   */
  file_hash: string;

  /**
   * Error message
   */
  message: string;
}

/**
 * Represents an issue with the reverse side of a document.
 * The error is considered resolved when the file with reverse side of the document changes.
 */
export interface IPassportElementErrorReverseSide {
  /**
   * Error source, must be `reverse_side`
   */
  source: 'reverse_side';

  /**
   * The section of the user's Telegram Passport which has the issue,
   * one of `driver_license`, `identity_card`
   */
  type: Types.PassportElementReverseSideErrors;

  /**
   * Base64-encoded hash of the file with the reverse side of the document
   */
  file_hash: string;

  /**
   * Error message
   */
  message: string;
}

/**
 * Represents an issue with the selfie with a document.
 * The error is considered resolved when the file with the selfie changes.
 */
export interface IPassportElementErrorSelfie {
  /**
   * Error source, must be `selfie`
   */
  source: 'selfie';

  /**
   * The section of the user's Telegram Passport which has the issue,
   * one of `passport`, `driver_license`, `identity_card`, `internal_passport`
   */
  type: Types.PassportElementSelfieErrors;

  /**
   * Base64-encoded hash of the file with the selfie
   */
  file_hash: string;

  /**
   * Error message
   */
  message: string;
}

/**
 * Represents an issue with a document scan.
 * The error is considered resolved when the file with the document scan changes.
 */
export interface IPassportElementErrorFile {
  /**
   * Error source, must be `file`
   */
  source: 'file';

  /**
   * The section of the user's Telegram Passport which has the issue,
   * one of `utility_bill`, `bank_statement`, `rental_agreement`,
   * `passport_registration`, `temporary_registration`
   */
  type: Types.PassportElementFileErrors;

  /**
   * Base64-encoded file hash
   */
  file_hash: string;

  /**
   * Error message
   */
  message: string;
}

/**
 * Represents an issue with a list of scans.
 * The error is considered resolved when the list of files containing the scans changes.
 */
export interface IPassportElementErrorFiles {
  /**
   * Error source, must be `files`
   */
  source: 'files';

  /**
   * The section of the user's Telegram Passport which has the issue,
   * one of `utility_bill`, `bank_statement`, `rental_agreement`,
   * `passport_registration`, `temporary_registration`
   */
  type: Types.PassportElementFilesErrors;

  /**
   * List of base64-encoded file hashes
   */
  file_hash: Array<string>;

  /**
   * Error message
   */
  message: string;
}

/**
 * Represents an issue with one of the files that constitute the translation of a document.
 * The error is considered resolved when the file changes.
 */
export interface IPassportElementErrorTranslationFile {
  /**
   * Error source, must be `translation_file`
   */
  source: 'translation_file';

  /**
   * Type of element of the user's Telegram Passport which has the issue,
   * one of `passport`, `driver_license`, `identity_card`, `internal_passport`,
   * `utility_bill`, `bank_statement`, `rental_agreement`, `passport_registration`,
   * `temporary_registration`
   */
  type: Types.PassportElementTranslationFileErrors;

  /**
   * Base64-encoded file hash
   */
  file_hash: string;

  /**
   * Error message
   */
  message: string;
}

/**
 * Represents an issue with the translated version of a document.
 * The error is considered resolved when a file with the document translation change.
 */
export interface IPassportElementErrorTranslationFiles {
  /**
   * Error source, must be `translation_files`
   */
  source: 'translation_files';

  /**
   * Type of element of the user's Telegram Passport which has the issue,
   * one of `passport`, `driver_license`, `identity_card`, `internal_passport`,
   * `utility_bill`, `bank_statement`, `rental_agreement`, `passport_registration`,
   * `temporary_registration`
   */
  type: Types.PassportElementTranslationFilesErrors;

  /**
   * List of base64-encoded file hashes
   */
  file_hash: Array<string>;

  /**
   * Error message
   */
  message: string;
}

/**
 * Represents an issue in an unspecified place.
 * The error is considered resolved when new data is added.
 */
export interface IPassportElementErrorUnspecified {
  /**
   * Error source, must be `unspecified`
   */
  source: 'unspecified';

  /**
   * Type of element of the user's Telegram Passport which has the issue
   */
  type: string;

  /**
   * Base64-encoded element hash
   */
  element_hash: string;

  /**
   * Error message
   */
  message: string;
}

/**
 * This object represents one row of the high scores table for a game.
 */
export interface IGameHighScore {
  /**
   * Position in high score table for the game
   */
  position: number;

  /**
   * User
   */
  user: IUser;

  /**
   * Score
   */
  score: number;
}

/**
 * Contains information about the current status of a webhook.
 */
export interface IWebhookInfo {
  /**
   * Webhook URL, may be empty if webhook is not set up
   */
  url: string;

  /**
   * True, if a custom certificate was provided for webhook certificate checks
   */
  has_custom_certificate: boolean;

  /**
   * Number of updates awaiting delivery
   */
  pending_update_count: number;

  /**
   * Unix time for the most recent error that happened when trying to deliver an update via webhook
   */
  last_error_date?: number;

  /**
   * Error message in human-readable format for the most recent error
   * that happened when trying to deliver an update via webhook
   */
  last_error_message?: string;

  /**
   * Maximum allowed number of simultaneous HTTPS connections to the webhook for update delivery
   */
  max_connections?: number;

  /**
   * A list of update types the bot is subscribed to.
   * Defaults to all update types
   */
  allowed_updates?: Array<Types.ContextPossibleTypes>;
}

/**
 * This object represents the content of a message to be sent as a result of an inline query.
 * Telegram clients currently support the following 4 types
 */
export type InputMessageContent =
  | IInputTextMessageContent
  | IInputLocationMessageContent
  | IInputVenueMessageContent
  | IInputContactMessageContent;

/**
 * Represents the content of a text message to be sent as the result of an inline query.
 */
export interface IInputTextMessageContent {
  message_text: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Disables link previews for links in the sent message
   */
  disable_web_page_preview?: boolean;
}

/**
 * Represents the content of a location message to be sent as the result of an inline query.
 */
export interface IInputLocationMessageContent {
  /**
   * Latitude of the location in degrees
   */
  latitude: number;

  /**
   * Longitude of the location in degrees
   */
  longitude: number;

  /**
   * Period in seconds for which the location can be updated,
   * should be between `60` and `86400`.
   */
  live_period?: number;
}

/**
 * Represents the content of a venue message to be sent as the result of an inline query.
 */
export interface IInputVenueMessageContent {
  /**
   * Latitude of the venue in degrees
   */
  latitude: number;

  /**
   * Longitude of the venue in degrees
   */
  longitude: number;

  /**
   * Name of the venue
   */
  title: string;

  /**
   * Address of the venue
   */
  address: string;

  /**
   * Foursquare identifier of the venue, if known
   */
  foursquare_id?: string;

  /**
   * Foursquare type of the venue, if known.
   * (For example, `arts_entertainment/default`, `arts_entertainment/aquarium` or `food/icecream`.)
   */
  foursquare_type?: string;
}

/**
 * Represents the content of a contact message to be sent as the result of an inline query.
 */
export interface IInputContactMessageContent {
  /**
   * Contact's phone number
   */
  phone_number: string;

  /**
   * Contact's first name
   */
  first_name: string;

  /**
   * Contact's last name
   */
  last_name?: string;

  /**
   * Additional data about the contact in the form of a vCard, 0-2048 bytes
   */
  vcard?: string;
}

/**
 * This object represents one result of an inline query.
 * Telegram clients currently support results of the following 20 types
 */
export type InlineQueryResult =
  | IInlineQueryResultCachedAudio
  | IInlineQueryResultCachedDocument
  | IInlineQueryResultCachedGif
  | IInlineQueryResultCachedMpeg4Gif
  | IInlineQueryResultCachedPhoto
  | IInlineQueryResultCachedSticker
  | IInlineQueryResultCachedVideo
  | IInlineQueryResultCachedVoice
  | IInlineQueryResultArticle
  | IInlineQueryResultAudio
  | IInlineQueryResultContact
  | IInlineQueryResultGame
  | IInlineQueryResultDocument
  | IInlineQueryResultGif
  | IInlineQueryResultLocation
  | IInlineQueryResultMpeg4Gif
  | IInlineQueryResultPhoto
  | IInlineQueryResultVenue
  | IInlineQueryResultVideo
  | IInlineQueryResultVoice;

/**
 * Represents a link to an MP3 audio file stored on the Telegram servers.
 * By default, this audio file will be sent by the user.
 * Alternatively, you can use `input_message_content` to send a message with the specified content
 * instead of the audio.
 */
export interface IInlineQueryResultCachedAudio {
  type: string;

  id: string;

  audio_file_id: string;

  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Content of the message to be sent instead of the audio
   */
  input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a file stored on the Telegram servers.
 * By default, this file will be sent by the user with an optional caption.
 * Alternatively, you can use `input_message_content` to send a message with
 * the specified content instead of the file.
 */
export interface IInlineQueryResultCachedDocument {
  /**
   * Type of the result, must be `document`
   */
  type: 'document';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Title for the result
   */
  title: string;

  /**
   * A valid file identifier for the file
   */
  document_file_id: string;

  /**
   * Short description of the result
   */
  description?: string;

  /**
   * Caption of the document to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Content of the message to be sent instead of the photo
   */
  input_message_content?: InputMessageContent;
}

/**
 * Represents a link to an animated GIF file stored on the Telegram servers.
 * By default, this animated GIF file will be sent by the user with an optional caption.
 * Alternatively, you can use `input_message_content` to send a message with
 * specified content instead of the animation.
 */
export interface IInlineQueryResultCachedGif {
  /**
   * Type of the result, must be `gif`
   */
  type: 'gif';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Title for the result
   */
  title: string;

  /**
   * A valid file identifier for the GIF file
   */
  gif_file_id: string;

  /**
   * Caption of the GIF to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Content of the message to be sent instead of the GIF animation
   */
  input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without sound) stored on the Telegram servers.
 * By default, this animated MPEG-4 file will be sent by the user with an optional caption.
 * Alternatively, you can use `input_message_content` to send a message with
 * specified content instead of the animation.
 */
export interface IInlineQueryResultCachedMpeg4Gif {
  /**
   * Type of the result, must be `mpeg4_gif`
   */
  type: 'mpeg4_gif';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Title for the result
   */
  title: string;

  /**
   * A valid file identifier for the MP4 file
   */
  mpeg4_file_id: string;

  /**
   * Caption of the MPEG-4 file to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Content of the message to be sent instead of the video animation
   */
  input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a photo stored on the Telegram servers.
 * By default, this photo will be sent by the user with an optional caption.
 * Alternatively, you can use `input_message_content` to send a message with
 * specified content instead of the animation.
 */
export interface IInlineQueryResultCachedPhoto {
  /**
   * Type of the result, must be `photo`
   */
  type: 'photo';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Title for the result
   */
  title: string;

  /**
   * A valid file identifier of the photoA valid file identifier for the MP4 file
   */
  photo_file_id: string;

  /**
   * Caption of the photo to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Content of the message to be sent instead of the photo
   */
  input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a sticker stored on the Telegram servers.
 * By default, this sticker will be sent by the user.
 * Alternatively, you can use `input_message_content` to send a message with
 * specified content instead of the animation.
 */
export interface IInlineQueryResultCachedSticker {
  /**
   * Type of the result, must be `sticker`
   */
  type: 'sticker';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * A valid file identifier of the photoA valid file identifier for the MP4 file
   */
  sticker_file_id: string;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Content of the message to be sent instead of the sticker
   */
  input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a video file stored on the Telegram servers.
 * By default, this video file will be sent by the user with an optional caption.
 * Alternatively, you can use `input_message_content` to send a message with
 * specified content instead of the animation.
 */
export interface IInlineQueryResultCachedVideo {
  /**
   * Type of the result, must be `video`
   */
  type: 'video';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Title for the result
   */
  title: string;

  /**
   * A valid file identifier for the video file
   */
  video_file_id: string;

  /**
   * Caption of the video to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Content of the message to be sent instead of the video
   */
  input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a voice message stored on the Telegram servers.
 * By default, this voice message will be sent by the user.
 * Alternatively, you can use `input_message_content` to send a message with
 * specified content instead of the animation.
 */
export interface IInlineQueryResultCachedVoice {
  /**
   * Type of the result, must be `voice`
   */
  type: 'voice';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Voice message title
   */
  title: string;

  /**
   * A valid file identifier for the voice message
   */
  voice_file_id: string;

  /**
   * Caption, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Content of the message to be sent instead of the voice message
   */
  input_message_content?: InputMessageContent;
}

/**
 * Represents a link to an article or web page.
 */
export interface IInlineQueryResultArticle {
  /**
   * Type of the result, must be `article`
   */
  type: 'article';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Voice message title
   */
  title: string;

  /**
   * Content of the message to be sent
   */
  input_message_content: InputMessageContent;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * URL of the result
   */
  url?: string;

  /**
   * Pass `True`, if you don't want the URL to be shown in the message
   */
  hide_url?: boolean;

  /**
   * Short description of the result
   */
  description?: string;

  /**
   * Url of the thumbnail for the result
   */
  thumb_url?: string;

  /**
   * Thumbnail width
   */
  thumb_width?: number;

  /**
   * Thumbnail height
   */
  thumb_height?: number;
}

/**
 * Represents a link to an MP3 audio file.
   * By default, this audio file will be sent by the user.
   * Alternatively, you can use `input_message_content` to send a message
   * with the specified content instead of the audio.
 */
export interface IInlineQueryResultAudio {
  type: 'audio';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Title
   */
  title: string;

  /**
   * A valid URL for the audio file
   */
  audio_url: string;

  /**
   * Caption, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Content of the message to be sent
   */
  input_message_content?: InputMessageContent;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Performer
   */
  performer?: string;

  /**
   * Audio duration in seconds
   */
  audio_duration?: number;
}

/**
 * Represents a contact with a phone number.
 * By default, this contact will be sent by the user.
 * Alternatively, you can use `input_message_content` to send a message
 * with the specified content instead of the contact.
 */
export interface IInlineQueryResultContact {
  /**
   * Type of the result, must be `contact`
   */
  type: 'contact';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Contact's phone number
   */
  phone_number: string;

  /**
   * Contact's first name
   */
  first_name: string;

  /**
   * Contact's last name
   */
  last_name?: string;

  /**
   * Additional data about the contact in the form of a vCard, 0-2048 bytes
   */
  vcard?: string;

  /**
   * Content of the message to be sent
   */
  input_message_content?: InputMessageContent;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Url of the thumbnail for the result
   */
  thumb_url?: string;

  /**
   * Thumbnail width
   */
  thumb_width?: number;

  /**
   * Thumbnail height
   */
  thumb_height?: number;
}

/**
 * Represents a Game.
 */
export interface IInlineQueryResultGame {
  /**
   * Type of the result, must be `game`
   */
  type: 'game';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Short name of the game
   */
  game_short_name: string;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;
}

/**
 * Represents a link to a file.
 * By default, this file will be sent by the user with an optional caption.
 * Alternatively, you can use `input_message_content` to send a message
 * with the specified content instead of the file.
 * Currently, only `.PDF` and `.ZIP` files can be sent using this method.
 */
export interface IInlineQueryResultDocument {
  /**
   * Type of the result, must be `document`
   */
  type: 'document';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Title for the result
   */
  title: string;

  /**
   * Caption of the document to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Content of the message to be sent instead of the file
   */
  input_message_content?: InputMessageContent;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * A valid URL for the file
   */
  document_url?: string;

  /**
   * Mime type of the content of the file, either `application/pdf` or `application/zip`
   */
  mime_type: Types.DocumentTypes;

  /**
   * Short description of the result
   */
  description: string;

  /**
   * URL of the thumbnail (jpeg only) for the file
   */
  thumb_url?: string;

  /**
   * Thumbnail width
   */
  thumb_width?: number;

  /**
   * Thumbnail height
   */
  thumb_height?: number;
}

/**
 * Represents a link to an animated GIF file.
 * By default, this animated GIF file will be sent by the user with optional caption.
 * Alternatively, you can use `input_message_content` to send a message
 * with the specified content instead of the file.
 */
export interface IInlineQueryResultGif {
  /**
   * Type of the result, must be `gif`
   */
  type: 'gif';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Title for the result
   */
  title: string;

  /**
   * URL of the static thumbnail for the result (jpeg or gif)
   */
  thumb_url: string;

  /**
   * A valid URL for the GIF file. File size must not exceed 1MB
   */
  gif_url: string;

  /**
   * Width of the GIF
   */
  gif_width?: number;

  /**
   * Height of the GIF
   */
  gif_height?: number;

  /**
   * Duration of the GIF
   */
  gif_duration?: number;

  /**
   * Caption of the document to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Content of the message to be sent instead of the GIF animation
   */
  input_message_content?: InputMessageContent;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;
}

/**
 * Represents a location on a map.
 * By default, the location will be sent by the user.
 * Alternatively, you can use `input_message_content` to send a message
 * with the specified content instead of the file.
 */
export interface IInlineQueryResultLocation extends IInputLocationMessageContent {
  /**
   * Type of the result, must be `location`
   */
  type: 'location';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Location title
   */
  title: string;

  /**
   * Content of the message to be sent instead of the file
   */
  input_message_content?: InputMessageContent;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Url of the thumbnail for the result
   */
  thumb_url?: string;

  /**
   * Thumbnail width
   */
  thumb_width?: number;

  /**
   * Thumbnail height
   */
  thumb_height?: number;
}

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without sound).
 * By default, this animated MPEG-4 file will be sent by the user with optional caption.
 * Alternatively, you can use `input_message_content` to send a message
 * with the specified content instead of the animation.
 */
export interface IInlineQueryResultMpeg4Gif {
  /**
   * Type of the result, must be `mpeg4_gif`
   */
  type: 'mpeg4_gif';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * A valid URL for the MP4 file. File size must not exceed 1MB
   */
  mpeg4_url: string;

  /**
   * Video width
   */
  mpeg4_width?: number;

  /**
   * Video height
   */
  mpeg4_height?: number;

  /**
   * Video duration
   */
  mpeg4_duration?: number;

  /**
   * URL of the static thumbnail (jpeg or gif) for the result
   */
  thumb_url: string;

  /**
   * Title for the result
   */
  title?: string;

  /**
   * Caption of the MPEG-4 file to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Content of the message to be sent instead of the video animation
   */
  input_message_content?: InputMessageContent;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;
}

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without sound).
 * By default, this animated MPEG-4 file will be sent by the user with optional caption.
 * Alternatively, you can use `input_message_content` to send a message
 * with the specified content instead of the animation.
 */
export interface IInlineQueryResultPhoto {
  /**
   * Type of the result, must be `photo`
   */
  type: 'photo';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * A valid URL of the photo. Photo must be in jpeg format. Photo size must not exceed 5MB
   */
  photo_url: string;

  /**
   * Photo width
   */
  photo_width?: number;

  /**
   * Photo height
   */
  photo_height?: number;

  /**
   * URL of the thumbnail for the photo
   */
  thumb_url: string;

  /**
   * Title for the result
   */
  title?: string;

  /**
   * Short description of the result
   */
  description?: string;

  /**
   * Caption of the photo to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Content of the message to be sent instead of the photo
   */
  input_message_content?: InputMessageContent;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;
}

/**
 * Represents a venue.
 * By default, the venue will be sent by the user.
 * Alternatively, you can use `input_message_content` to send a message
 * with the specified content instead of the animation.
 */
export interface IInlineQueryResultVenue {
  /**
   * Type of the result, must be `venue`
   */
  type: 'venue';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * Longitude of the venue location in degrees
   */
  longitude: number;

  /**
   * Latitude of the venue location in degrees
   */
  latitude: number;

  /**
   * Title of the venue
   */
  title: string;

  /**
   * Address of the venue
   */
  address: string;

  /**
   * Foursquare identifier of the venue if known
   */
  foursquare_id?: string;

  /**
   * Foursquare type of the venue, if known.
   * (For example, `arts_entertainment/default`, `arts_entertainment/aquarium` or `food/icecream`.)
   */
  foursquare_type?: string;

  /**
   * Content of the message to be sent instead of the photo
   */
  input_message_content?: InputMessageContent;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Url of the thumbnail for the result
   */
  thumb_url?: string;

  /**
   * Thumbnail width
   */
  thumb_width?: number;

  /**
   * Thumbnail height
   */
  thumb_height?: number;
}

/**
 * Represents a link to a page containing an embedded video player or a video file.
 * By default, this video file will be sent by the user with an optional caption.
 * Alternatively, you can use `input_message_content` to send a message
 * with the specified content instead of the animation.
 */
export interface IInlineQueryResultVideo {
  /**
   * Type of the result, must be `video`
   */
  type: 'video';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * A valid URL for the embedded video player or video file
   */
  video_url: string;

  /**
   * Title for the result
   */
  title: string;

  /**
   * Mime type of the content of video url, `text/html` or `video/mp4`
   */
  mime_type: Types.VideoTypes;

  /**
   * URL of the thumbnail (jpeg only) for the video
   */
  thumb_url: string;

  /**
   * Caption of the video to be sent, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Content of the message to be sent instead of the video.
   * 
   * This field is **required** if `InlineQueryResultVideo` is used to send an HTML-page as a result
   * (e.g., a YouTube video).
   */
  input_message_content?: InputMessageContent;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Video width
   */
  video_width?: number;

  /**
   * Video height
   */
  video_height?: number;

  /**
   * Video duration in seconds
   */
  video_duration?: number;

  /**
   * Short description of the result
   */
  description?: string;
}

/**
 * Represents a link to a voice recording in an `.OGG` container encoded with `OPUS`.
 * By default, this voice recording will be sent by the user.
 * Alternatively, you can use `input_message_content` to send a message
 * with the specified content instead of the the voice message.
 */
export interface IInlineQueryResultVoice {
  /**
   * Type of the result, must be `voice`
   */
  type: 'voice';

  /**
   * Unique identifier for this result, 1-64 bytes
   */
  id: string;

  /**
   * A valid URL for the voice recording
   */
  voice_url: string;

  /**
   * Recording title
   */
  title: string;

  /**
   * Caption, 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Content of the message to be sent instead of the video.
   * 
   * This field is **required** if `InlineQueryResultVideo` is used to send an HTML-page as a result
   * (e.g., a YouTube video).
   */
  input_message_content?: InputMessageContent;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating).
   */
  reply_markup?: Types.InlineKeyboardMarkup;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show **bold**, *italic*, `fixed-width text`
   * or [inline URLs](https://core.telegram.org/bots/api#formatting-options) in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Recording duration in seconds
   */
  voice_duration?: number;
}
