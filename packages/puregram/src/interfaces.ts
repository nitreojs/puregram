import { Agent } from 'https';
import { UpdateName, MessageEntities } from './types';

import {
  ChatType,
  EntityType,
  MaskPositionPoint,
  DiceEmoji,
  PollType,
  EncryptedPassportElementType,
  InputMediaType,
  ParseMode,
  TelegramInputFile,
  ChatMemberStatus,
  InlineQueryType,
  PassportElementSource
} from './types';

import {
  Keyboard,
  KeyboardBuilder,
  InlineKeyboardBuilder,
  InlineKeyboard,
  ForceReply,
  RemoveKeyboard
} from './common/keyboards';

export interface TelegramOptions {
  token?: string;

  agent?: Agent;

  mergeEvents?: boolean;

  apiBaseUrl?: string;

  apiRetryLimit?: number;

  apiTimeout?: number;

  apiHeaders?: Record<string, string>;

  apiWait?: number;
}

export interface TelegramUpdate {
  update_id: number;

  message?: TelegramMessage;

  edited_message?: TelegramMessage;

  channel_post?: TelegramMessage;

  edited_channel_post?: TelegramMessage;

  inline_query?: TelegramInlineQuery;

  chosen_inline_result?: TelegramChosenInlineResult;

  callback_query?: TelegramCallbackQuery;

  shipping_query?: TelegramShippingQuery;

  pre_checkout_query?: TelegramPreCheckoutQuery;

  poll?: TelegramPoll;

  poll_answer?: TelegramPollAnswer;
}

export interface TelegramUser {
  id: number;

  is_bot: boolean;

  first_name: string;

  last_name?: string;

  username?: string;

  language_code?: string;

  can_join_groups?: boolean;

  can_read_all_group_messages?: boolean;

  supports_inline_queries?: boolean;
}

export interface TelegramChatPhoto {
  small_file_id: string;

  small_file_unique_id: string;

  big_file_id: string;

  big_file_unique_id: string;
}

export interface TelegramChatPermissions {
  can_send_messages?: boolean;

  can_send_media_messages?: boolean;

  can_send_polls?: boolean;

  can_send_other_messages?: boolean;

  can_add_web_page_previews?: boolean;

  can_change_info?: boolean;

  can_invite_users?: boolean;

  can_pin_messages?: boolean;
}

export interface TelegramWebhookInfo {
  url: string;

  has_custom_certificate: boolean;

  pending_update_count: number;

  ip_address?: string;

  last_error_date?: number;

  last_error_message?: string;

  max_connections?: number;

  allowed_updates?: UpdateName[];
}

export interface TelegramChatLocation {
  location: TelegramLocation;

  address: string;
}

export type TelegramChatUnion = TelegramChatPrivate
  | TelegramChatGroup
  | TelegramChatSupergroup
  | TelegramChatChannel;

interface TelegramChatBase {
  id: number;

  type: ChatType;

  photo?: TelegramChatPhoto;

  bio?: string;

  linked_chat_id?: number;

  location?: TelegramChatLocation;

  can_set_sticker_set?: boolean;
}

export interface TelegramChatPrivate extends TelegramChatBase {
  type: 'private';

  username: string;

  first_name: string;

  last_name?: string;
}

export interface TelegramChatGroup extends TelegramChatBase {
  type: 'group';

  title: string;

  description?: string;

  invite_link?: string;

  pinned_message?: TelegramMessage;

  permissions?: TelegramChatPermissions;
}

export interface TelegramChatSupergroup extends TelegramChatBase {
  type: 'supergroup';

  title: string;

  username: string;

  description?: string;

  invite_link?: string;

  pinned_message?: TelegramMessage;

  permissions?: TelegramChatPermissions;

  slow_mode_delay?: number;

  sticker_set_name?: string;
}

export interface TelegramChatChannel extends TelegramChatBase {
  type: 'channel';

  title: string;

  username?: string;

  description?: string;

  invite_link?: string;

  pinned_message?: TelegramMessage;
}

export type TelegramMessageEntityUnion = TelegramMessageEntity
  | TelegramMessageEntityTextLink
  | TelegramMessageEntityTextMention
  | TelegramMessageEntityPre;

export interface TelegramMessageEntity {
  type: EntityType;

  offset: number;

  length: number;
}

export interface TelegramMessageEntityTextLink extends TelegramMessageEntity {
  type: 'text_link';

  url: string;
}

export interface TelegramMessageEntityTextMention extends TelegramMessageEntity {
  type: 'text_mention';

  user: TelegramUser;
}

export interface TelegramMessageEntityPre extends TelegramMessageEntity {
  type: 'pre';

  language: string;
}

export interface TelegramMessage {
  message_id: number;

  from?: TelegramUser;

  sender_chat?: TelegramChatUnion;

  date: number;

  chat: TelegramChatUnion;

  forward_from?: TelegramUser;

  forward_from_chat?: TelegramChatUnion;

  forward_from_message_id?: number;

  forward_signature?: string;

  forward_sender_name?: string;

  forward_date?: number;

  reply_to_message?: TelegramMessage;

  via_bot?: TelegramUser;

  edit_date?: number;

  media_group_id?: string;

  author_signature?: string;

  text?: string;

  entities?: TelegramMessageEntity[];

  // Attachments

  animation?: TelegramAnimation;

  audio?: TelegramAudio;

  document?: TelegramDocument;

  photo?: TelegramPhotoSize[];

  sticker?: TelegramSticker;

  video?: TelegramVideo;

  video_note?: TelegramVideoNote;

  voice?: TelegramVoice;

  // Structures

  caption?: string;

  caption_entities?: TelegramMessageEntity[];

  contact?: TelegramContact;

  dice?: TelegramDice;

  game?: TelegramGame;

  poll?: TelegramPoll;

  venue?: TelegramVenue;

  location?: TelegramLocation;

  // Events

  new_chat_members?: TelegramUser[];

  left_chat_member?: TelegramUser;

  new_chat_title?: string;

  new_chat_photo?: TelegramPhotoSize[];

  delete_chat_photo?: true;

  group_chat_created?: true;

  supergroup_chat_created?: true;

  channel_chat_created?: true;

  migrate_to_chat_id?: number;

  migrate_from_chat_id?: number;

  pinned_message?: TelegramMessage;

  invoice?: TelegramInvoice;

  successful_payment?: TelegramSuccessfulPayment;

  connected_website?: string;

  passport_data?: TelegramPassportData;

  proximity_alert_triggered?: TelegramProximityAlertTriggered;

  reply_markup?: TelegramInlineKeyboardMarkup;
}

export interface ForwardMessagePayload {
  from?: TelegramUser;

  from_chat?: TelegramChatUnion;

  from_message_id?: number;

  signature?: string;

  sender_name?: string;

  date: number;
}

export interface TelegramPhotoSize {
  file_id: string;

  file_unique_id: string;

  width: number;

  height: number;

  file_size?: number;
}

export interface TelegramAttachment {
  file_id: string;

  file_unique_id: string;
}

export interface TelegramAnimation extends TelegramAttachment {
  width: number;

  height: number;

  duration: number;

  thumb?: TelegramPhotoSize;

  file_name?: string;

  mime_type?: string;

  file_size?: number;
}

export interface TelegramAudio extends TelegramAttachment {
  duration: number;

  performer?: string;

  title?: string;

  file_name?: string;

  mime_type?: string;

  file_size?: number;

  thumb?: TelegramPhotoSize;
}

export interface TelegramDocument extends TelegramAttachment {
  thumb?: TelegramPhotoSize;

  file_name?: string;

  mime_type?: string;

  file_size?: number;
}

export interface TelegramMaskPosition {
  point: MaskPositionPoint;

  x_shift: number;

  y_shift: number;

  scale: number;
}

export interface TelegramSticker extends TelegramAttachment {
  width: number;

  height: number;

  is_animated: boolean;

  thumb?: TelegramPhotoSize;

  emoji?: string;

  set_name?: string;

  mask_position?: TelegramMaskPosition;

  file_size?: number;
}

export interface TelegramVideo extends TelegramAttachment {
  width: number;

  height: number;

  duration: number;

  thumb?: TelegramPhotoSize;

  file_name?: string;

  mime_type?: string;

  file_size?: number;
}

export interface TelegramVideoNote extends TelegramAttachment {
  length: number;

  duration: number;

  thumb?: TelegramPhotoSize;

  file_size?: number;
}

export interface TelegramVoice extends TelegramAttachment {
  duration: number;

  mime_type?: string;

  file_size?: number;
}

export interface TelegramContact {
  phone_number: string;

  first_name: string;

  last_name?: string;

  user_id?: number;

  vcard?: string;
}

export interface TelegramDice {
  emoji: DiceEmoji;

  value: number;
}

export interface TelegramGame {
  title: string;

  description: string;

  photo: TelegramPhotoSize[];

  text?: string;

  text_entities?: TelegramMessageEntity[];

  animation?: TelegramAnimation;
}

export interface TelegramPollOption {
  text: string;

  voter_count: number;
}

export interface TelegramPoll {
  id: string;

  question: string;

  options: TelegramPollOption[];

  total_voter_count: number;

  is_closed: boolean;

  is_anonymous: boolean;

  type: PollType;

  allows_multiple_answers: boolean;

  correct_option_id?: number;

  explanation?: string;

  explanation_entities?: TelegramMessageEntity[];

  open_period?: number;

  close_date?: number;
}

export interface TelegramLocation {
  longitude: number;

  latitude: number;

  horizontal_accuracy?: number;

  live_period?: number;

  heading?: number;

  proximity_alert_radius?: number;
}

export interface TelegramVenue {
  location: TelegramLocation;

  title: string;

  address: string;

  foursquare_id?: string;

  foursquare_type?: string;

  google_place_id?: string;

  google_place_type?: string;
}

export interface TelegramInvoice {
  title: string;

  description: string;

  start_parameter: string;

  currency: string;

  total_amount: number;
}

export interface TelegramShippingAddress {
  country_code: string;

  state: string;

  city: string;

  street_line1: string;

  street_line2: string;

  post_code: string;
}

export interface TelegramOrderInfo {
  name?: string;

  phone_number?: string;

  email?: string;

  shipping_address?: TelegramShippingAddress;
}

export interface TelegramSuccessfulPayment {
  currency: string;

  total_amount: number;

  invoice_payload: string;

  shipping_option_id?: string;

  order_info?: TelegramOrderInfo;

  telegram_payment_charge_id: string;

  provider_payment_charge_id: string;
}

export interface TelegramPassportFile {
  file_id: string;

  file_unique_id: string;

  file_size: number;

  file_date: number;
}

export type TelegramEncryptedPassportElementUnion = TelegramEncryptedPassportElementPersonalDetails
  | TelegramEncryptedPassportElementPassport
  | TelegramEncryptedPassportElementDriverLicense
  | TelegramEncryptedPassportElementIdentityCard
  | TelegramEncryptedPassportElementInternalPassport
  | TelegramEncryptedPassportElementAddress
  | TelegramEncryptedPassportElementUtilityBill
  | TelegramEncryptedPassportElementBankStatement
  | TelegramEncryptedPassportElementRentalAgreement
  | TelegramEncryptedPassportElementPassportRegistration
  | TelegramEncryptedPassportElementTemporaryRegistration
  | TelegramEncryptedPassportElementPhoneNumber
  | TelegramEncryptedPassportElementEmail;

export interface TelegramEncryptedPassportElement {
  type: EncryptedPassportElementType;

  hash: string;
}

export interface TelegramEncryptedPassportElementPersonalDetails
  extends TelegramEncryptedPassportElement {
  type: 'personal_details';

  data: string;
}

export interface TelegramEncryptedPassportElementPassport extends TelegramEncryptedPassportElement {
  type: 'passport';

  data: string;

  front_side: TelegramPassportFile;

  selfie: TelegramPassportFile;

  translation: TelegramPassportFile[];
}

export interface TelegramEncryptedPassportElementDriverLicense
  extends TelegramEncryptedPassportElement {
  type: 'driver_license';

  data: string;

  front_side: TelegramPassportFile;

  reverse_side: TelegramPassportFile;

  selfie: TelegramPassportFile;

  translation: TelegramPassportFile[];
}

export interface TelegramEncryptedPassportElementIdentityCard
  extends TelegramEncryptedPassportElement {
  type: 'identity_card';

  data: string;

  front_side: TelegramPassportFile;

  reverse_side: TelegramPassportFile;

  selfie: TelegramPassportFile;

  translation: TelegramPassportFile[];
}

export interface TelegramEncryptedPassportElementInternalPassport
  extends TelegramEncryptedPassportElement {
  type: 'internal_passport';

  data: string;

  front_side: TelegramPassportFile;

  selfie: TelegramPassportFile;

  translation: TelegramPassportFile[];
}

export interface TelegramEncryptedPassportElementAddress extends TelegramEncryptedPassportElement {
  type: 'address';

  data: string;
}

export interface TelegramEncryptedPassportElementUtilityBill
  extends TelegramEncryptedPassportElement {
  type: 'utility_bill';

  files: TelegramPassportFile[];

  translation: TelegramPassportFile[];
}

export interface TelegramEncryptedPassportElementBankStatement
  extends TelegramEncryptedPassportElement {
  type: 'bank_statement';

  files: TelegramPassportFile[];

  translation: TelegramPassportFile[];
}

export interface TelegramEncryptedPassportElementRentalAgreement
  extends TelegramEncryptedPassportElement {
  type: 'rental_agreement';

  files: TelegramPassportFile[];

  translation: TelegramPassportFile[];
}

export interface TelegramEncryptedPassportElementPassportRegistration
  extends TelegramEncryptedPassportElement {
  type: 'passport_registration';

  files: TelegramPassportFile[];

  translation: TelegramPassportFile[];
}

export interface TelegramEncryptedPassportElementTemporaryRegistration
  extends TelegramEncryptedPassportElement {
  type: 'temporary_registration';

  files: TelegramPassportFile[];

  translation: TelegramPassportFile[];
}

export interface TelegramEncryptedPassportElementPhoneNumber
  extends TelegramEncryptedPassportElement {
  type: 'phone_number';

  phone_number: string;
}

export interface TelegramEncryptedPassportElementEmail extends TelegramEncryptedPassportElement {
  type: 'email';

  email: string;
}

export interface TelegramEncryptedCredentials {
  data: string;

  hash: string;

  secret: string;
}

export interface TelegramPassportData {
  data: TelegramEncryptedPassportElementUnion[];

  credentials: TelegramEncryptedCredentials;
}

export interface TelegramLoginUrl {
  url: string;

  forward_text?: string;

  bot_username?: string;

  request_write_access?: boolean;
}

export interface TelegramCallbackGame { }

export interface TelegramInlineKeyboardButton {
  text: string;

  url?: string;

  login_url?: TelegramLoginUrl;

  callback_data?: string;

  switch_inline_query?: string;

  switch_inline_query_current_chat?: string;

  callback_game?: TelegramCallbackGame;

  pay?: boolean;
}

export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramInlineQuery {
  id: string;

  from: TelegramUser;

  location?: TelegramLocation;

  query: string;

  offset: string;
}

export interface TelegramChosenInlineResult {
  result_id: string;

  from: TelegramUser;

  location?: TelegramLocation;

  inline_message_id?: string;

  query: string;
}

export interface TelegramCallbackQuery {
  id: string;

  from: TelegramUser;

  message?: TelegramMessage;

  inline_message_id?: string;

  chat_instance: string;

  data?: string;

  game_short_name?: string;
}

export interface TelegramShippingQuery {
  id: string;

  from: TelegramUser;

  invoice_payload: string;

  shipping_address: TelegramShippingAddress;
}

export interface TelegramPreCheckoutQuery {
  id: string;

  from: TelegramUser;

  currency: string;

  total_amount: number;

  invoice_payload: string;

  shipping_option_id?: string;

  order_info?: TelegramOrderInfo;
}

export interface TelegramPollAnswer {
  poll_id: string;

  user: TelegramUser;

  option_ids: number[];
}

/**
 * This object represents type of a poll, which is allowed to be created and
 * sent when the corresponding button is pressed.
 */
export interface TelegramKeyboardButtonPollType {
  /**
   * If `quiz` is passed, the user will be allowed to create only polls in the
   * quiz mode.
   * If `regular` is passed, only regular polls will be allowed.
   * Otherwise, the user will be allowed to create a poll of any type.
   */
  type: PollType;
}

/**
 * This object represents one button of the reply keyboard.
 * For simple text buttons String can be used instead of this object to specify
 * text of the button. Optional fields `request_contact`, `request_location`,
 * and `request_poll` are mutually exclusive.
 */
export interface TelegramKeyboardButton {
  /**
   * Text of the button. If none of the optional fields are used,
   * it will be sent as a message when the button is pressed
   */
  text: string;

  /**
   * If `true`, the user's phone number will be sent as a contact when the
   * button is pressed. Available in private chats only
   */
  request_contact?: boolean;

  /**
   * If `true`, the user's current location will be sent when the button is
   * pressed. Available in private chats only
   */
  request_location?: boolean;

  /**
   * If specified, the user will be asked to create a poll and send it to
   * the bot when the button is pressed. Available in private chats only
   */
  request_poll?: TelegramKeyboardButtonPollType;
}

/** This object represents a custom keyboard with reply options */
export interface TelegramReplyKeyboardMarkup {
  /**
   * Array of button rows, each represented by an
   * `Array of KeyboardButton` objects
   */
  keyboard: TelegramKeyboardButton[][];

  /**
   * Requests clients to resize the keyboard vertically for optimal fit
   * (e.g., make the keyboard smaller if there are just two rows of buttons).
   * Defaults to false, in which case the custom keyboard is always of the same
   * height as the app's standard keyboard.
   *
   * @default false
   */
  resize_keyboard?: boolean;

  /**
   * Requests clients to hide the keyboard as soon as it's been used.
   * The keyboard will still be available, but clients will automatically
   * display the usual letter-keyboard in the chat – the user can press a
   * special button in the input field to see the custom keyboard again
   *
   * @default false
   */
  one_time_keyboard?: boolean;

  /**
   * Use this parameter if you want to show the keyboard to specific users only.
   * Targets:
   *
   *   **1**) users that are `@mentioned` in the text of the Message object;
   *
   *   **2**) if the bot's message is a reply (has `reply_to_message_id`),
   *          sender of the original message.
   *
   * Example: A user requests to change the bot's language, bot replies to the
   * request with a keyboard to select the new language. Other users in the
   * group don't see the keyboard.
   *
   * @default false
   */
  selective?: boolean;
}

/**
 * Upon receiving a message with this object,
 * Telegram clients will remove the current custom keyboard and display
 * the default letter-keyboard. By default, custom keyboards are displayed
 * until a new keyboard is sent by a bot. An exception is made for one-time
 * keyboards that are hidden immediately after the user presses a button
 * (see `ReplyKeyboardMarkup`).
 */
export interface TelegramReplyKeyboardRemove {
  /**
   * Requests clients to remove the custom keyboard
   * (user will not be able to summon this keyboard;
   * if you want to hide the keyboard from sight but keep it accessible,
   * use `one_time_keyboard` in `ReplyKeyboardMarkup`)
   */
  remove_keyboard: true;

  /**
   * Use this parameter if you want to remove the keyboard for specific users
   * only.
   * Targets:
   *
   *   **1**) users that are `@mentioned` in the text of the Message object;
   *   **2**) if the bot's message is a reply (has `reply_to_message_id`),
   *          sender of the original message.
   *
   * Example: A user votes in a poll, bot returns confirmation message in reply
   * to the vote and removes the keyboard for that user, while still showing
   * the keyboard with poll options to users who haven't voted yet.
   */
  selective?: boolean;
}

/**
 * Upon receiving a message with this object,
 * Telegram clients will display a reply interface to the user
 * (act as if the user has selected the bot's message and tapped 'Reply').
 * This can be extremely useful if you want to create user-friendly
 * step-by-step interfaces without having to sacrifice privacy mode.
 */
export interface TelegramForceReply {
  /**
   * Shows reply interface to the user, as if they manually selected the
   * bot's message and tapped 'Reply'
   */
  force_reply: true;

  /**
   * Use this parameter if you want to remove the keyboard for specific users
   * only.
   * Targets:
   *
   *   **1**) users that are `@mentioned` in the text of the Message object;
   *   **2**) if the bot's message is a reply (has `reply_to_message_id`),
   *          sender of the original message.
   */
  selective?: boolean;
}

/** Inline keyboard or keyboard or keyboard remove or force reply */
export type ReplyMarkupUnion = TelegramInlineKeyboardMarkup
  | TelegramReplyKeyboardMarkup
  | TelegramReplyKeyboardRemove
  | TelegramForceReply
  | Keyboard
  | KeyboardBuilder
  | InlineKeyboard
  | InlineKeyboardBuilder
  | ForceReply
  | RemoveKeyboard;

export interface ApiResponseOk {
  ok: true;

  result: object;
}

export interface ApiResponseError {
  ok: false;

  description: string;

  error_code: number;

  parameters?: any;
}

export type ApiResponseUnion = ApiResponseOk | ApiResponseError;

export interface InputMedia {
  /** Type of the result */
  type: InputMediaType;

  /**
   * File to send.
   * Pass a `file_id` to send a file that exists on the Telegram servers
   * (recommended), pass an HTTP URL for Telegram to get a file from the
   * Internet, or pass `attach://<file_attach_name>` to upload a new one
   * using `multipart/form-data` under `<file_attach_name>` name.
   */
  media: string;

  /** Caption of the media to be sent, 0-1024 characters after entities parsing */
  caption?: string;

  /** Mode for parsing entities in the media caption */
  parse_mode?: ParseMode;

  /**
   * List of special entities that appear in the caption,
   * which can be specified instead of `parse_mode`
   */
  caption_entities?: MessageEntities;
}

export interface InputMediaPhoto extends InputMedia {
  type: 'photo';
}

export interface InputMediaVideo extends InputMedia {
  type: 'video';

  /**
   * Thumbnail of the video sent;
   * can be ignored if thumbnail generation for the file is supporte
   * server-side. The thumbnail should be in **JPEG** format and less than
   * `200 kB` in size. A thumbnail's width and height should not exceed `320`.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can't be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>` if the thumbnail was
   * uploaded using `multipart/form-data` under `<file_attach_name>`.
   */
  thumb?: TelegramInputFile;

  /** Video width */
  width?: number;

  /** Video height */
  height?: number;

  /** Video duration */
  duration?: number;

  /** Pass `true`, if the uploaded video is suitable for streaming */
  supports_streaming?: boolean;
}

export interface InputMediaAnimation extends InputMedia {
  type: 'animation';

  /**
   * Thumbnail of the video sent;
   * can be ignored if thumbnail generation for the file is supporte
   * server-side. The thumbnail should be in **JPEG** format and less than
   * `200 kB` in size. A thumbnail's width and height should not exceed `320`.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can't be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>` if the thumbnail was
   * uploaded using `multipart/form-data` under `<file_attach_name>`.
   */
  thumb?: TelegramInputFile;

  /** Animation width */
  width?: number;

  /** Animation height */
  height?: number;

  /** Animation duration */
  duration?: number;
}

export interface InputMediaAudio extends InputMedia {
  type: 'audio';

  /**
   * Thumbnail of the video sent;
   * can be ignored if thumbnail generation for the file is supporte
   * server-side. The thumbnail should be in **JPEG** format and less than
   * `200 kB` in size. A thumbnail's width and height should not exceed `320`.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can't be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>` if the thumbnail was
   * uploaded using `multipart/form-data` under `<file_attach_name>`.
   */
  thumb?: TelegramInputFile;

  /** Audio duration */
  duration?: number;

  /** Performer of the audio */
  performer?: string;

  /** Title of the audio */
  title?: string;
}

export interface InputMediaDocument extends InputMedia {
  type: 'document';

  /**
   * List of special entities that appear in the caption,
   * which can be specified instead of `parse_mode`
   */
  caption_entities?: TelegramMessageEntity[];

  /**
   * Thumbnail of the video sent;
   * can be ignored if thumbnail generation for the file is supporte
   * server-side. The thumbnail should be in **JPEG** format and less than
   * `200 kB` in size. A thumbnail's width and height should not exceed `320`.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can't be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>` if the thumbnail was
   * uploaded using `multipart/form-data` under `<file_attach_name>`.
   */
  thumb?: TelegramInputFile;

  /**
   * Disables automatic server-side content type detection
   * for files uploaded using `multipart/form-data`.
   * Always `true`, if the document is sent as part of an album.
   */
  disable_content_type_detection?: boolean;
}

export type InputMediaUnion = InputMediaPhoto
  | InputMediaVideo
  | InputMediaAnimation
  | InputMediaAudio
  | InputMediaDocument;

export interface TelegramUserProfilePhotos {
  total_count: number;

  photos: TelegramPhotoSize[][];
}

export interface TelegramFile {
  file_id: string;

  file_unique_id: string;

  file_size?: number;

  file_path?: string;
}

export interface TelegramChatMember {
  user: TelegramUser;

  status: ChatMemberStatus;

  custom_title?: string;

  is_anonymous?: boolean;

  until_date?: number;

  can_be_edited?: boolean;

  can_post_messages?: boolean;

  can_edit_messages?: boolean;

  can_delete_messages?: boolean;

  can_restrict_members?: boolean;

  can_promote_members?: boolean;

  can_change_info?: boolean;

  can_invite_users?: boolean;

  can_pin_messages?: boolean;

  is_member?: boolean;

  can_send_messages?: boolean;

  can_send_media_messages?: boolean;

  can_send_polls?: boolean;

  can_send_other_messages?: boolean;

  can_add_web_page_previews?: boolean;
}

export interface TelegramBotCommand {
  command: string;

  description: string;
}

export interface TelegramStickerSet {
  name: string;

  title: string;

  is_animated: boolean;

  contains_masks: boolean;

  stickers: TelegramSticker[];

  thumb?: TelegramPhotoSize;
}

export interface TelegramInlineQueryResult {
  type: InlineQueryType;

  id: string;

  caption_entities?: MessageEntities;
}

export interface TelegramInlineQueryResultArticle extends TelegramInlineQueryResult {
  type: 'article';

  id: string;

  title: string;

  input_message_content: InputMessageContentUnion;

  reply_markup?: TelegramReplyKeyboardMarkup;

  url?: string;

  hide_url?: boolean;

  description?: string;

  thumb_url?: string;

  thumb_width?: number;

  thumb_height?: number;
}

export interface TelegramInlineQueryResultPhoto extends TelegramInlineQueryResult {
  type: 'photo';

  id: string;

  photo_url: string;

  thumb_url: string;

  photo_width?: number;

  photo_height?: number;

  title?: string;

  description?: string;

  caption?: string;

  parse_mode?: ParseMode;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultGif extends TelegramInlineQueryResult {
  type: 'gif';

  id: string;

  gif_url: string;

  gif_width?: number;

  gif_height?: number;

  gif_duration?: number;

  thumb_url: string;

  thumb_mime_type?: string;

  title?: string;

  caption?: string;

  parse_mode?: ParseMode;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultMpeg4Gif extends TelegramInlineQueryResult {
  type: 'mpeg4_gif';

  id: string;

  mpeg4_url: string;

  mpeg4_width?: number;

  mpeg4_height?: number;

  mpeg4_duration?: number;

  thumb_url: string;

  thumb_mime_type?: string;

  title?: string;

  caption?: string;

  parse_mode?: ParseMode;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultVideo extends TelegramInlineQueryResult {
  type: 'video';

  id: string;

  video_url: string;

  mime_type: string;

  thumb_url: string;

  title: string;

  caption?: string;

  parse_mode?: ParseMode;

  video_width?: number;

  video_height?: number;

  video_duration?: number;

  description?: string;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultAudio extends TelegramInlineQueryResult {
  type: 'audio';

  id: string;

  audio_url: string;

  title: string;

  caption?: string;

  parse_mode?: ParseMode;

  performer?: string;

  audio_duration?: number;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultVoice extends TelegramInlineQueryResult {
  type: 'voice';

  id: string;

  voice_url: string;

  title: string;

  caption?: string;

  parse_mode?: ParseMode;

  voice_duration?: number;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultDocument extends TelegramInlineQueryResult {
  type: 'document';

  id: string;

  title: string;

  caption?: string;

  parse_mode?: ParseMode;

  document_url: string;

  mime_type: string;

  description?: string;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;

  thumb_url?: string;

  thumb_width?: number;

  thumb_height?: number;
}

export interface TelegramInlineQueryResultLocation extends TelegramInlineQueryResult {
  type: 'location';

  id: string;

  latitude: number;

  longitude: number;

  title: string;

  horizontal_accuracy?: number;

  live_period?: number;

  heading?: number;

  proximity_alert_radius?: number;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;

  thumb_url?: string;

  thumb_width?: number;

  thumb_height?: number;
}

export interface TelegramInlineQueryResultVenue extends TelegramInlineQueryResult {
  type: 'venue';

  id: string;

  latitude: number;

  longitude: number;

  title: string;

  address: string;

  foursquare_id?: string;

  foursquare_type?: string;

  google_place_id?: string;

  google_place_type?: string;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;

  thumb_url?: string;

  thumb_width?: number;

  thumb_height?: number;
}

export interface TelegramInlineQueryResultContact extends TelegramInlineQueryResult {
  type: 'contact';

  id: string;

  phone_number: string;

  first_name: string;

  last_name?: string;

  vcard?: string;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;

  thumb_url?: string;

  thumb_width?: number;

  thumb_height?: number;
}

export interface TelegramInlineQueryResultGame extends TelegramInlineQueryResult {
  type: 'game';

  id: string;

  game_short_name: string;

  reply_markup?: TelegramInlineKeyboardMarkup;
}

export interface TelegramInlineQueryResultCachedPhoto extends TelegramInlineQueryResult {
  type: 'photo';

  id: string;

  photo_file_id: string;

  title?: string;

  description?: string;

  caption?: string;

  parse_mode?: ParseMode;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultCachedGif extends TelegramInlineQueryResult {
  type: 'gif';

  id: string;

  gif_file_id: string;

  title?: string;

  caption?: string;

  parse_mode?: ParseMode;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultCachedMpeg4Gif extends TelegramInlineQueryResult {
  type: 'mpeg4_gif';

  id: string;

  mpeg4_file_id: string;

  title?: string;

  caption?: string;

  parse_mode?: ParseMode;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultCachedSticker extends TelegramInlineQueryResult {
  type: 'sticker';

  id: string;

  sticker_file_id: string;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultCachedDocument extends TelegramInlineQueryResult {
  type: 'document';

  id: string;

  title: string;

  document_file_id: string;

  description?: string;

  caption?: string;

  parse_mode?: ParseMode;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultCachedVideo extends TelegramInlineQueryResult {
  type: 'video';

  id: string;

  video_file_id: string;

  title: string;

  description?: string;

  caption?: string;

  parse_mode?: ParseMode;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultCachedVoice extends TelegramInlineQueryResult {
  type: 'voice';

  id: string;

  voice_file_id: string;

  title: string;

  caption?: string;

  parse_mode?: ParseMode;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInlineQueryResultCachedAudio extends TelegramInlineQueryResult {
  type: 'audio';

  id: string;

  audio_file_id: string;

  caption?: string;

  parse_mode?: ParseMode;

  reply_markup?: TelegramInlineKeyboardMarkup;

  input_message_content?: InputMessageContentUnion;
}

export interface TelegramInputTextMessageContent {
  message_text: string;

  parse_mode?: ParseMode;

  disable_web_page_preview?: boolean;

  entities?: MessageEntities;
}

export interface TelegramInputLocationMessageContent {
  latitude: number;

  longitude: number;

  horizontal_accuracy?: number;

  live_period?: number;

  heading?: number;

  proximity_alert_radius?: number;
}

export interface TelegramInputVenueMessageContent {
  latitude: number;

  longitude: number;

  title: string;

  address: string;

  foursquare_id?: string;

  foursquare_type?: string;

  google_place_id?: string;

  google_place_type?: string;
}

export interface TelegramInputContactMessageContent {
  phone_number: string;

  first_name: string;

  last_name?: string;

  vcard?: string;
}

export type InputMessageContentUnion = TelegramInputTextMessageContent
  | TelegramInputLocationMessageContent
  | TelegramInputVenueMessageContent
  | TelegramInputContactMessageContent;

export type InlineQueryResultUnion = TelegramInlineQueryResultCachedAudio
  | TelegramInlineQueryResultCachedDocument
  | TelegramInlineQueryResultCachedGif
  | TelegramInlineQueryResultCachedMpeg4Gif
  | TelegramInlineQueryResultCachedPhoto
  | TelegramInlineQueryResultCachedSticker
  | TelegramInlineQueryResultCachedVideo
  | TelegramInlineQueryResultCachedVoice
  | TelegramInlineQueryResultArticle
  | TelegramInlineQueryResultAudio
  | TelegramInlineQueryResultContact
  | TelegramInlineQueryResultGame
  | TelegramInlineQueryResultDocument
  | TelegramInlineQueryResultGif
  | TelegramInlineQueryResultLocation
  | TelegramInlineQueryResultMpeg4Gif
  | TelegramInlineQueryResultPhoto
  | TelegramInlineQueryResultVenue
  | TelegramInlineQueryResultVideo
  | TelegramInlineQueryResultVoice;

export interface TelegramLabeledPrice {
  label: string;

  amount: number;
}

export interface TelegramShippingOption {
  id: string;

  title: string;

  prices: TelegramLabeledPrice[];
}

export interface TelegramPassportElementError {
  source: PassportElementSource;

  type: EncryptedPassportElementType;

  message: string;
}

export interface TelegramPassportElementErrorDataField extends TelegramPassportElementError {
  source: 'data';

  type: 'personal_details' | 'passport' | 'driver_license' | 'identity_card' | 'internal_passport' | 'address';

  field_name: string;

  data_hash: string;

  message: string;
}

export interface TelegramPassportElementErrorFrontSide extends TelegramPassportElementError {
  source: 'front_side';

  type: 'passport' | 'driver_license' | 'identity_card' | 'internal_passport';

  file_hash: string;

  message: string;
}

export interface TelegramPassportElementErrorReverseSide extends TelegramPassportElementError {
  source: 'reverse_side';

  type: 'driver_license' | 'identity_card';

  file_hash: string;

  message: string;
}

export interface TelegramPassportElementErrorSelfie extends TelegramPassportElementError {
  source: 'selfie';

  type: 'passport' | 'driver_license' | 'identity_card' | 'internal_passport';

  file_hash: string;

  message: string;
}

export interface TelegramPassportElementErrorFile extends TelegramPassportElementError {
  source: 'file';

  type: 'utility_bill' | 'bank_statement' | 'rental_agreement' | 'passport_registration' | 'temporary_registration';

  file_hash: string;

  message: string;
}

export interface TelegramPassportElementErrorFiles extends TelegramPassportElementError {
  source: 'files';

  type: 'utility_bill' | 'bank_statement' | 'rental_agreement' | 'passport_registration' | 'temporary_registration';

  file_hashes: string[];

  message: string;
}

export interface TelegramPassportElementErrorTranslationFile extends TelegramPassportElementError {
  source: 'translation_file';

  type: 'passport' | 'driver_license' | 'identity_card' | 'internal_passport' | 'utility_bill' | 'bank_statement' | 'rental_agreement' | 'passport_registration' | 'temporary_registration';

  file_hash: string;

  message: string;
}

export interface TelegramPassportElementErrorTranslationFiles extends TelegramPassportElementError {
  source: 'translation_files';

  type: 'passport' | 'driver_license' | 'identity_card' | 'internal_passport' | 'utility_bill' | 'bank_statement' | 'rental_agreement' | 'passport_registration' | 'temporary_registration';

  file_hashes: string[];

  message: string;
}

export interface TelegramPassportElementErrorUnspecified {
  source: 'unspecified';

  type: string;

  element_hash: string;

  message: string;
}

export type PassportElementErrorUnion = TelegramPassportElementErrorDataField
  | TelegramPassportElementErrorFrontSide
  | TelegramPassportElementErrorReverseSide
  | TelegramPassportElementErrorSelfie
  | TelegramPassportElementErrorFile
  | TelegramPassportElementErrorFiles
  | TelegramPassportElementErrorTranslationFile
  | TelegramPassportElementErrorTranslationFiles
  | TelegramPassportElementErrorUnspecified;

export interface TelegramGameHighScore {
  position: number;

  user: TelegramUser;

  score: number;
}

export interface KeyboardTextButton {
  text: string;
}

export interface KeyboardRequestContactButton {
  text: string;

  request_contact: true;
}

export interface KeyboardRequestLocationButton {
  text: string;

  request_location: true;
}

export interface KeyboardRequestPollButton {
  text: string;

  request_poll: KeyboardPollButton;
}

export interface KeyboardPollButton {
  type?: PollType;
}

export interface KeyboardOptions {
  /**
   * Text of the button.
   * If none of the optional fields are used,
   * it will be sent as a message when
   * the button is pressed
   */
  text: string;

  /**
   * If `true`, the user's phone number will be
   * sent as a contact when the button is pressed.
   * Available in private chats only
   */
  request_contact?: boolean;

  /**
   * If `true`, the user's current location will be
   * sent when the button is pressed.
   * Available in private chats only
   */
  request_location?: boolean;

  /**
   * If specified, the user will be asked to create
   * a poll and send it to the bot when the button
   * is pressed. Available in private chats only
   */
  request_poll?: KeyboardButtonPollType;
}

export interface KeyboardButtonPollType {
  /**
   * If `quiz` is passed, the user will be allowed to
   * create only polls in the quiz mode.
   *
   * If `regular` is passed, only regular polls will be allowed.
   *
   * Otherwise, the user will be allowed to create a poll of any type.
   */
  type?: PollType;
}

export interface KeyboardJSON {
  keyboard: KeyboardOptions[][];

  resize_keyboard: boolean;

  one_time_keyboard: boolean;

  selective: boolean;
}

export interface InlineKeyboardTextButton {
  text: string;

  callback_data: string;
}

export interface InlineKeyboardUrlButton {
  text: string;

  url: string;

  callback_data: string;
}

export interface InlineKeyboardSwitchToCurrentChatButton {
  text: string;

  switch_inline_query_current_chat: string;
}

export interface InlineKeyboardSwitchToChatButton {
  text: string;

  switch_inline_query: string;
}

export interface InlineKeyboardGameButton {
  text: string;

  callback_game: TelegramCallbackGame;
}

export interface InlineKeyboardLoginButton {
  text: string;

  login_url: TelegramLoginUrl;
}

export interface InlineKeyboardPayButton {
  text: string;

  pay: true;
}

export interface TelegramProximityAlertTriggered {
  traveler: TelegramUser;

  watcher: TelegramUser;

  distance: number;
}

export interface TelegramMessageId {
  message_id: number;
}
