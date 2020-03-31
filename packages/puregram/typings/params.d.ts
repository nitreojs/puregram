import Types from './types';
import { Agent } from 'https';
import Interfaces from './interfaces';

type AllowArray<T> = T | Array<T>;

export interface ITelegramParams {
  token: string;

  apiUrl?: string;

  agent?: Agent;
}

export interface IGetUpdatesParams {
  /**
   * Identifier of the first update to be returned.
   * Must be greater by one than the highest among
   * the identifiers of previously received updates.
   * By default, updates starting with the earliest
   * unconfirmed update are returned.
   * An update is considered confirmed as soon as
   * getUpdates is called with an offset higher than
   * its update_id. The negative offset can be specified
   * to retrieve updates starting from -offset update
   * from the end of the updates queue.
   * All previous updates will forgotten.
   */
  offset?: number;

  /**
   * Limits the number of updates to be retrieved.
   * Values between 1—100 are accepted.
   * Defaults to 100.
   */
  limit?: number;

  /**
   * Timeout in seconds for long polling.
   * Defaults to 0, i.e. usual short polling
   * Should be positive,
   * short polling should be used for
   * testing purposes only.
   */
  timeout?: number;

  /**
   * List the types of updates you want your bot to receive.
   * For example, specify `['message', 'edited_channel_post', 'callback_query']`
   * to only receive updates of these types.
   * See [Update](https://core.telegram.org/bots/api#update)
   * for a complete list of available update types.
   * Specify an empty list to receive all updates regardless of type (default).
   * If not specified, the previous setting will be used.
   *
   * Please note that this parameter doesn't affect updates created before the call
   * to the getUpdates, so unwanted updates may be received for a short period of time.
   */
  allowed_updates?: AllowArray<Types.ContextPossibleTypes>;
}

/**
 * Use this method to send text messages.
 * 
 * On success, the sent `Message` is returned.
 */
export interface ISendMessageParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: string | number;

  /**
   * Text of the message to be sent
   */
  text: string;

  /**
   * Send [Markdown](https://core.telegram.org/bots/api#markdown-style)
   * or [HTML](https://core.telegram.org/bots/api#html-style),
   * if you want Telegram apps to show **bold**, _italic_,
   * `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#sendmessage)
   * in your bot's message.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Disables link previews for links in this message
   */
  disable_web_page_preview?: boolean;

  /**
   * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply,
   * ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating),
   * [custom reply keyboard](https://core.telegram.org/bots#keyboards),
   * instructions to remove reply keyboard or to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to forward messages of any kind.
 * 
 * On success, the sent `Message` is returned.
 */
export interface IForwardMessageParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Unique identifier for the chat where the original message was sent
   * (or channel username in the format `@channelusername`)
   */
  from_chat_id: number | string;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * Message identifier in the chat specified in `from_chat_id`
   */
  message_id: number;
}

/**
 * Use this method to send photos.
 * 
 * On success, the sent `Message` is returned.
 */
export interface ISendPhotoParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Photo to send.
   * 
   * Pass a `file_id` as String to send a photo that exists on the Telegram servers (recommended),
   * pass an HTTP URL as a String for Telegram to get a photo from the Internet,
   * or upload a new photo using `multipart/form-data`.
   */
  photo: Interfaces.IInputFile | string;

  /**
   * Photo caption (may also be used when resending photos by `file_id`),
   * 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show
   * **bold**, *italic*, `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#formatting-options)
   * in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

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
export interface ISendAudioParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Audio file to send.
   * 
   * Pass a `file_id` as String to send an audio file that exists on the Telegram servers (recommended),
   * pass an HTTP URL as a String for Telegram to get an audio file from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  audio: Interfaces.IInputFile | string;

  /**
   * Audio caption,
   * 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show
   * **bold**, *italic*, `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#formatting-options)
   * in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Duration of the audio in seconds
   */
  duration?: number;

  /**
   * Performer
   */
  performer?: string;

  /**
   * Track name
   */
  title?: string;

  /**
   * Thumbnail of the file sent;
   * can be ignored if thumbnail generation for the file is supported server-side.
   * The thumbnail should be in JPEG format and less than 200 kB in size.
   * A thumbnail‘s width and height should not exceed 320.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can’t be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>`
   * if the thumbnail was uploaded using `multipart/form-data` under `<file_attach_name>`.
   */
  thumb?: Interfaces.IInputFile | string;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to send general files.
 * 
 * On success, the sent `Message` is returned.
 * 
 * Bots can currently send files of any type of up to 50 MB in size,
 * this limit may be changed in the future.
 */
export interface ISendDocumentParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * File to send.
   * 
   * Pass a `file_id` as String to send a file that exists on the Telegram servers (recommended),
   * pass an HTTP URL as a String for Telegram to get a file from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  document: Interfaces.IInputFile | string;

  /**
   * Thumbnail of the file sent;
   * can be ignored if thumbnail generation for the file is supported server-side.
   * The thumbnail should be in JPEG format and less than 200 kB in size.
   * A thumbnail‘s width and height should not exceed 320.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can’t be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>`
   * if the thumbnail was uploaded using `multipart/form-data` under `<file_attach_name>`.
   */
  thumb?: Interfaces.IInputFile | string;

  /**
   * Document caption (may also be used when resending documents by `file_id`),
   * 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show
   * **bold**, *italic*, `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#formatting-options)
   * in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

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
export interface ISendVideoParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Video file to send.
   * 
   * Pass a `file_id` as String to send an audio file that exists on the Telegram servers (recommended),
   * pass an HTTP URL as a String for Telegram to get an audio file from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  video: Interfaces.IInputFile | string;

  /**
   * Video caption,
   * 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show
   * **bold**, *italic*, `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#formatting-options)
   * in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Duration of sent video in seconds
   */
  duration?: number;

  /**
   * Width
   */
  width?: number;

  /**
   * Height
   */
  height?: number;

  /**
   * Thumbnail of the file sent;
   * can be ignored if thumbnail generation for the file is supported server-side.
   * The thumbnail should be in JPEG format and less than 200 kB in size.
   * A thumbnail‘s width and height should not exceed 320.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can’t be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>`
   * if the thumbnail was uploaded using `multipart/form-data` under `<file_attach_name>`.
   */
  thumb?: Interfaces.IInputFile | string;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * Pass `True`, if the uploaded video is suitable for streaming
   */
  supports_streaming?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to send animation files
 * (GIF or H.264/MPEG-4 AVC video without sound).
 * 
 * On success, the sent `Message` is returned.
 * 
 * Bots can currently send animation files of up to 50 MB in size,
 * this limit may be changed in the future.
 */
export interface ISendAnimationParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Animation to send.
   * 
   * Pass a `file_id` as String to send an audio file that exists on the Telegram servers (recommended),
   * pass an HTTP URL as a String for Telegram to get an audio file from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  animation: Interfaces.IInputFile | string;

  /**
   * Animation caption,
   * 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show
   * **bold**, *italic*, `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#formatting-options)
   * in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Duration of sent animation in seconds
   */
  duration?: number;

  /**
   * Width
   */
  width?: number;

  /**
   * Height
   */
  height?: number;

  /**
   * Thumbnail of the file sent;
   * can be ignored if thumbnail generation for the file is supported server-side.
   * The thumbnail should be in JPEG format and less than 200 kB in size.
   * A thumbnail‘s width and height should not exceed 320.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can’t be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>`
   * if the thumbnail was uploaded using `multipart/form-data` under `<file_attach_name>`.
   */
  thumb?: Interfaces.IInputFile | string;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * Pass `True`, if the uploaded video is suitable for streaming
   */
  supports_streaming?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

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
export interface ISendVoiceParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Voice to send.
   * 
   * Pass a `file_id` as String to send an audio file that exists on the Telegram servers (recommended),
   * pass an HTTP URL as a String for Telegram to get an audio file from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  voice: Interfaces.IInputFile | string;

  /**
   * Voice caption,
   * 0-1024 characters after entities parsing
   */
  caption?: string;

  /**
   * Send `Markdown` or `HTML`, if you want Telegram apps to show
   * **bold**, *italic*, `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#formatting-options)
   * in the media caption.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Duration of the voice message in seconds
   */
  duration?: number;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * Pass `True`, if the uploaded video is suitable for streaming
   */
  supports_streaming?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * As of v.4.0, Telegram clients support rounded square mp4 videos
 * of up to 1 minute long.
 * Use this method to send video messages.
 * 
 * On success, the sent `Message` is returned.
 */
export interface ISendVideoNoteParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Video note to send.
   * 
   * Pass a `file_id` as String to send an audio file that exists on the Telegram servers (recommended),
   * pass an HTTP URL as a String for Telegram to get an audio file from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  video_note: Interfaces.IInputFile | string;

  /**
   * Duration of sent video in seconds
   */
  duration?: number;

  /**
   * Video width and height, i.e. diameter of the video message
   */
  length?: number;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * Pass `True`, if the uploaded video is suitable for streaming
   */
  supports_streaming?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to send a group of photos or videos as an album.
 * 
 * On success, an `Array<Message>` is returned.
 */
export interface ISendMediaGroupParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * A JSON-serialized array describing photos and videos to be sent, must include 2–10 items
   */
  media: Array<Interfaces.IInputMediaPhoto | Interfaces.IInputMediaVideo>;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;
}

/**
 * Use this method to send point on the map.
 * 
 * On success, the sent `Message` is returned.
 */
export interface ISendLocationParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Latitude of the location
   */
  latitude: number;

  /**
   * Longitude of the location
   */
  longitude: number;

  /**
   * Period in seconds for which the location will be updated, should be between 60 and 86400.
   */
  live_period?: number;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to edit live location messages.
 * A location can be edited until its live_period expires
 * or editing is explicitly disabled by a call to `stopMessageLiveLocation`.
 * 
 * On success, if the edited message was sent by the bot,
 * the edited `Message` is returned, otherwise `True` is returned.
 */
export interface editMessageLiveLocation {
  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Identifier of the message to edit
   */
  message_id?: number;

  /**
   * Required if `chat_id` and `message_id` are not specified.
   * 
   * Identifier of the inline message
   */
  inline_message_id?: string;

  /**
   * Latitude of the location
   */
  latitude: number;

  /**
   * Longitude of the location
   */
  longitude: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to stop updating a live location message
 * before live_period expires.
 * 
 * On success, if the message was sent by the bot,
 * the sent `Message` is returned, otherwise `True` is returned.
 */
export interface IStopMessageLiveLocationParams {
  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Identifier of the message to edit
   */
  message_id?: number;

  /**
   * Required if `chat_id` and `message_id` are not specified.
   * 
   * Identifier of the inline message
   */
  inline_message_id?: string;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to send information about a venue.
 * 
 * On success, the sent `Message` is returned.
 */
export interface ISendVenueParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  /**
   * Latitude of the venue
   */
  latitude: number;

  /**
   * Longitude of the venue
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
   * Foursquare identifier of the venue
   */
  foursquare_id: string;

  /**
   * Foursquare type of the venue, if known.
   * 
   * For example, `arts_entertainment/default`, `arts_entertainment/aquarium` or `food/icecream`.
   */
  foursquare_type: string;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to send phone contacts.
 * 
 * On success, the sent `Message` is returned.
 */
export interface ISendContactParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

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
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to send a native poll.
 * 
 * On success, the sent `Message` is returned.
 */
export interface ISendPollParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Poll question, 1-255 characters
   */
  question: string;

  /**
   * A JSON-serialized list of answer options, 2-10 strings 1-100 characters each
   */
  options: Array<string>;

  /**
   * `True`, if the poll needs to be anonymous, defaults to `True`
   */
  is_anonymous?: boolean;

  /**
   * Poll type, `quiz` or `regular`, defaults to `regular`
   */
  type?: Types.PollTypes;

  /**
   * `True`, if the poll allows multiple answers, ignored for polls in quiz mode, defaults to `False`
   */
  allows_multiple_answers?: boolean;

  /**
   * 0-based identifier of the correct answer option, required for polls in quiz mode
   */
  correct_option_id?: number;

  /**
   * Pass `True`, if the poll needs to be immediately closed.
   * This can be useful for poll preview.
   */
  is_closed?: boolean;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to send a dice, which will have a random value from `1` to `6`.
 * 
 * On success, the sent `Message` is returned.
 */
export interface ISendDiceParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard,
   * custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method when you need to tell the user that
 * something is happening on the bot's side.
 * The status is set for 5 seconds or less
 * (when a message arrives from your bot,
 * Telegram clients clear its typing status).
 * 
 * Returns `True` on success.
 */
export interface ISendChatActionParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Type of action to broadcast.
   * 
   * Choose one, depending on what the user is about to receive:
   * - `typing` for **text messages**;
   * - `upload_photo` for **photos**;
   * - `record_video` or `upload_video` for **videos**;
   * - `record_audio` or `upload_audio` for **audio files**;
   * - `upload_document` for **general files**;
   * - `find_location` for **location data**;
   * - `record_video_note` or `upload_video_note` for **video notes**.
   */
  action: Types.ChatActions;
}

/**
 * Use this method to get a list of profile pictures for a user.
 * 
 * Returns a `UserProfilePhotos` object.
 */
export interface IGetUserProfilePhotosParams {
  /**
   * Unique identifier of the target user
   */
  user_id: number;

  /**
   * Sequential number of the first photo to be returned.
   * By default, all photos are returned.
   */
  offset?: number;

  /**
   * Limits the number of photos to be retrieved.
   * Values between 1—100 are accepted.
   * Defaults to `100`.
   */
  limit?: number;
}

/**
 * Use this method to kick a user from a group, a supergroup or a channel.
 * In the case of supergroups and channels,
 * the user will not be able to return to the group
 * on their own using invite links, etc., unless unbanned first.
 * The bot must be an administrator in the chat for this to work
 * and must have the appropriate admin rights.
 * 
 * Returns `True` on success.
 */
export interface IKickChatMemberParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Unique identifier of the target user
   */
  user_id: number;

  /**
   * Date when the user will be unbanned, unix time.
   * If user is banned for more than 366 days or less than 30 seconds from the current time
   * they are considered to be banned forever
   */
  until_date?: number;
}

/**
 * Use this method to unban a previously kicked user in a supergroup or channel.
 * The user will not return to the group or channel automatically,
 * but will be able to join via link, etc.
 * The bot must be an administrator for this to work.
 * 
 * Returns `True` on success.
 */
export interface IUnbanChatMemberParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Unique identifier of the target user
   */
  user_id: number;
}

/**
 * Use this method to restrict a user in a supergroup.
 * The bot must be an administrator in the supergroup
 * for this to work and must have the appropriate admin rights.
 * Pass `True` for all permissions to lift restrictions from a user.
 * 
 * Returns `True` on success.
 */
export interface IRestrictChatMemberParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Unique identifier of the target user
   */
  user_id: number;

  /**
   * New user permissions
   */
  permissions: Interfaces.IChatPermissions;

  /**
   * Date when restrictions will be lifted for the user, unix time.
   * If user is banned for more than 366 days or less than 30 seconds from the current time
   * they are considered to be banned forever
   */
  until_date?: number;
}

/**
 * Use this method to promote or demote a user in a supergroup or a channel.
 * The bot must be an administrator in the chat for this to work
 * and must have the appropriate admin rights.
 * Pass `False` for all boolean parameters to demote a user.
 * 
 * Returns `True` on success.
 */
export interface IPromoteChatMemberParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Unique identifier of the target user
   */
  user_id: number;

  /**
   * Pass `True`, if the administrator can change chat title, photo and other settings
   */
  can_change_info?: boolean;

  /**
   * Pass `True`, if the administrator can create channel posts, channels only
   */
  can_post_messages?: boolean;

  /**
   * Pass `True`, if the administrator can edit messages of other users and can pin messages, channels only
   */
  can_edit_messages?: boolean;

  /**
   * Pass `True`, if the administrator can delete messages of other users
   */
  can_delete_messages?: boolean;

  /**
   * Pass `True`, if the administrator can invite new users to the chat
   */
  can_invite_users?: boolean;

  /**
   * Pass `True`, if the administrator can restrict, ban or unban chat members
   */
  can_restrict_members?: boolean;

  /**
   * Pass `True`, if the administrator can pin messages, supergroups only
   */
  can_pin_messages?: boolean;

  /**
   * Pass `True`, if the administrator can add new administrators with a subset of
   * his own privileges or demote administrators that he has promoted,
   * directly or indirectly (promoted by administrators that were appointed by him)
   */
  can_promote_members?: boolean;
}

/**
 * Use this method to set a custom title for an administrator
 * in a supergroup promoted by the bot.
 * 
 * Returns `True` on success.
 */
export interface ISetChatAdministratorCustomTitleParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Unique identifier of the target user
   */
  user_id: number;

  /**
   * New custom title for the administrator;
   * 0-16 characters, emoji are not allowed
   */
  custom_title: string;
}

/**
 * Use this method to set default chat permissions for all members.
 * The bot must be an administrator in the group or a supergroup
 * for this to work and must have the `can_restrict_members` admin rights.
 * 
 * Returns `True` on success.
 */
export interface ISetChatPermissionsParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * New user permissions
   */
  permissions: Interfaces.IChatPermissions;
}

/**
 * Use this method to set a new profile photo for the chat.
 * Photos can't be changed for private chats.
 * The bot must be an administrator in the chat for this
 * to work and must have the appropriate admin rights.
 * 
 * Returns `True` on success.
 */
export interface ISetChatPhotoParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * New chat photo, uploaded using `multipart/form-data`
   */
  photo: Interfaces.IInputFile;
}

/**
 * Use this method to change the title of a chat.
 * Titles can't be changed for private chats.
 * The bot must be an administrator in the chat for this
 * to work and must have the appropriate admin rights.
 * 
 * Returns `True` on success.
 */
export interface ISetChatTitleParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * New chat title, 1-255 characters
   */
  title: string;
}

/**
 * Use this method to change the description of a group, a supergroup or a channel.
 * The bot must be an administrator in the chat for this
 * to work and must have the appropriate admin rights.
 * 
 * Returns `True` on success.
 */
export interface ISetChatDescriptionParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * New chat description, 0-255 characters
   */
  description: string;
}

/**
 * Use this method to pin a message in a group, a supergroup, or a channel.
 * The bot must be an administrator in the chat for this
 * to work and must have the `can_pin_messages` admin right
 * in the supergroup or `can_edit_messages` admin right in the channel.
 * 
 * Returns `True` on success.
 */
export interface IPinChatMessageParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Identifier of a message to pin
   */
  message_id: number;

  /**
   * Pass `True`, if it is not necessary to send a notification to all chat members about the new pinned message.
   * Notifications are always disabled in channels.
   */
  disable_notification?: boolean;
}

/**
 * Use this method to get information about a member of a chat.
 * 
 * Returns a `ChatMember` object on success.
 */
export interface IGetChatMemberParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Unique identifier of the target user
   */
  user_id: number;
}

/**
 * Use this method to set a new group sticker set for a supergroup.
 * The bot must be an administrator in the chat for this
 * to work and must have the appropriate admin rights.
 * Use the field `can_set_sticker_set` optionally returned in
 * `getChat` requests to check if the bot can use this method.
 * 
 * Returns `True` on success.
 */
export interface ISetChatStickerSetParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Name of the sticker set to be set as the group sticker set
   */
  sticker_set_name: string;
}

export interface IAnswerCallbackQueryParams {
  /**
   * Unique identifier for the query to be answered
   */
  callback_query_id: string;

  /**
   * Text of the notification.
   * 
   * If not specified, nothing will be shown to the user, 0-200 characters
   */
  text?: string;

  /**
   * If `true`, an alert will be shown by the client instead of
   * a notification at the top of the chat screen.
   * Defaults to `false`.
   */
  show_alert?: boolean;

  /**
   * URL that will be opened by the user's client.
   * If you have created a `Game` and accepted the conditions via @Botfather,
   * specify the URL that opens your game – note that this will only work if the query
   * comes from a `callback_game` button.
   * 
   * Otherwise, you may use links like `t.me/your_bot?start=XXXX` that open your bot with a parameter.
   */
  url?: string;

  /**
   * The maximum amount of time in seconds that the result of the callback query may be cached client-side.
   * Telegram apps will support caching starting in version 3.14.
   * Defaults to `0`.
   */
  cache_time?: number;
}

/**
 * Use this method to edit text and game messages.
 * 
 * On success, if edited message is sent by the bot,
 * the edited `Message` is returned,
 * otherwise `True` is returned.
 */
export interface IEditMessageTextParams {
  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Identifier of the message to edit
   */
  message_id?: number;

  /**
   * Required if `chat_id` and `message_id` are not specified.
   * 
   * Identifier of the inline message
   */
  inline_message_id?: string;

  /**
   * New text of the message, 1-4096 characters after entities parsing
   */
  text: string;

  /**
   * Send [Markdown](https://core.telegram.org/bots/api#markdown-style)
   * or [HTML](https://core.telegram.org/bots/api#html-style),
   * if you want Telegram apps to show **bold**, _italic_,
   * `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#sendmessage)
   * in your bot's message.
   */
  parse_mode?: Types.ParseModes;

  /**
   * Disables link previews for links in this message
   */
  disable_web_page_preview?: boolean;

  /**
   * A JSON-serialized object for an inline keyboard.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to edit captions of messages.
 * 
 * On success, if edited message is sent by the bot,
 * the edited `Message` is returned,
 * otherwise `True` is returned.
 */
export interface IEditMessageCaptionParams {
  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Identifier of the message to edit
   */
  message_id?: number;

  /**
   * Required if `chat_id` and `message_id` are not specified.
   * 
   * Identifier of the inline message
   */
  inline_message_id?: string;

  /**
   * New caption of the message, 0-1024 characters after entities parsing
   */
  caption: string;

  /**
   * Send [Markdown](https://core.telegram.org/bots/api#markdown-style)
   * or [HTML](https://core.telegram.org/bots/api#html-style),
   * if you want Telegram apps to show **bold**, _italic_,
   * `fixed-width text` or [inline URLs](https://core.telegram.org/bots/api#sendmessage)
   * in your bot's message.
   */
  parse_mode?: Types.ParseModes;

  /**
   * A JSON-serialized object for an inline keyboard.
   */
  reply_markup?: Types.ReplyMarkup;
}

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
export interface IEditMessageMediaParams {
  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Identifier of the message to edit
   */
  message_id?: number;

  /**
   * Required if `chat_id` and `message_id` are not specified.
   * 
   * Identifier of the inline message
   */
  inline_message_id?: string;

  /**
   * A JSON-serialized object for a new media content of the message
   */
  media: Types.InputMedia;

  /**
   * A JSON-serialized object for an inline keyboard.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to edit only the reply markup of messages.
 * 
 * On success, if edited message is sent by the bot,
 * the edited `Message` is returned,
 * otherwise `True` is returned.
 */
export interface IEditMessageReplyMarkupParams {
  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Identifier of the message to edit
   */
  message_id?: number;

  /**
   * Required if `chat_id` and `message_id` are not specified.
   * 
   * Identifier of the inline message
   */
  inline_message_id?: string;

  /**
   * A JSON-serialized object for an inline keyboard.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to stop a poll which was sent by the bot.
 * 
 * On success, the stopped `Poll` with the final results is returned.
 */
export interface IStopPollParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  /**
   * Identifier of the original message with the poll
   */
  message_id?: number;

  /**
   * A JSON-serialized object for an inline keyboard.
   */
  reply_markup?: Types.ReplyMarkup;
}

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
export interface IDeleteMessageParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  /**
   * Identifier of the original message with the poll
   */
  message_id?: number;
}

/**
 * Use this method to send static .WEBP or animated .TGS stickers.
 * 
 * On success, the sent `Message` is returned.
 */
export interface ISendStickerParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  /**
   * Sticker to send.
   * 
   * Pass a `file_id` as String to send a file that exists on the Telegram servers (recommended),
   * pass an HTTP URL as a String for Telegram to get a .WEBP file from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  sticker: Interfaces.IInputFile | string;

  /**
   * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply,
   * ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating),
   * [custom reply keyboard](https://core.telegram.org/bots#keyboards),
   * instructions to remove reply keyboard or to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to upload a .PNG file with a sticker for later use
 * in `createNewStickerSet` and `addStickerToSet` methods
 * (can be used multiple times).
 * 
 * Returns the uploaded `File` on success.
 */
export interface IUploadStickerFileParams {
  /**
   * User identifier of sticker file owner
   */
  user_id: number;

  /**
   * **Png** image with the sticker, must be up to 512 kilobytes in size,
   * dimensions must not exceed 512px, and either width or height must be exactly 512px. 
   */
  png_sticker: Interfaces.IInputFile;
}

/**
 * Use this method to create a new sticker set owned by a user.
 * The bot will be able to edit the sticker set thus created.
 * You must use exactly one of the fields `png_sticker` or `tgs_sticker`.
 * 
 * Returns `True` on success.
 */
export interface ICreateNewStickerSetParams {
  /**
   * User identifier of created sticker set owner
   */
  user_id: number;

  /**
   * Short name of sticker set, to be used in `t.me/addstickers/` URLs (e.g., animals).
   * Can contain only english letters, digits and underscores.
   * Must begin with a letter, can't contain consecutive underscores and must end in `_by_<bot username>`.
   * `<bot_username>` is case insensitive.
   * 1-64 characters.
   */
  name: string;

  /**
   * Sticker set title, 1-64 characters
   */
  title: string;

  /**
   * **PNG** image with the sticker, must be up to 512 kilobytes in size,
   * dimensions must not exceed 512px, and either width or height must be exactly 512px.
   * 
   * Pass a `file_id` as a String to send a file that already exists on the Telegram servers,
   * pass an HTTP URL as a String for Telegram to get a file from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  png_sticker?: Interfaces.IInputFile | string;

  /**
   * **TGS** animation with the sticker, uploaded using `multipart/form-data`.
   */
  tgs_sticker?: Interfaces.IInputFile;

  /**
   * One or more emoji corresponding to the sticker
   */
  emojis: string;

  /**
   * Pass `True`, if a set of mask stickers should be created
   */
  contains_masks?: boolean;

  /**
   * A JSON-serialized object for position where the mask should be placed on faces
   */
  mask_position?: Interfaces.IMaskPosition;
}

/**
 * Use this method to add a new sticker to a set created by the bot.
 * You must use exactly one of the fields `png_sticker` or `tgs_sticker`.
 * Animated stickers can be added to animated sticker sets and only to them.
 * Animated sticker sets can have up to 50 stickers.
 * Static sticker sets can have up to 120 stickers.
 * 
 * Returns `True` on success.
 */
export interface IAddStickerToSetParams {
  /**
   * User identifier of sticker set owner
   */
  user_id: number;

  /**
   * Sticker set name
   */
  name: string;

  /**
   * **PNG** image with the sticker, must be up to 512 kilobytes in size,
   * dimensions must not exceed 512px, and either width or height must be exactly 512px.
   * 
   * Pass a `file_id` as a String to send a file that already exists on the Telegram servers,
   * pass an HTTP URL as a String for Telegram to get a file from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  png_sticker?: Interfaces.IInputFile | string;

  /**
   * **TGS** animation with the sticker, uploaded using `multipart/form-data`.
   */
  tgs_sticker?: Interfaces.IInputFile;

  /**
   * One or more emoji corresponding to the sticker
   */
  emojis: string;

  /**
   * A JSON-serialized object for position where the mask should be placed on faces
   */
  mask_position?: Interfaces.IMaskPosition;
}

/**
 * Use this method to move a sticker in a set created by the bot to a specific position.
 * 
 * Returns `True` on success.
 */
export interface ISetStickerPositionInSetParams {
  /**
   * File identifier of the sticker
   */
  sticker: string;

  /**
   * New sticker position in the set, 0-based
   */
  position: number;
}

/**
 * Use this method to set the thumbnail of a sticker set.
 * Animated thumbnails can be set for animated sticker sets only.
 * 
 * Returns `True` on success.
 */
export interface ISetStickerSetThumbParams {
  /**
   * Sticker set name
   */
  name: string;

  /**
   * User identifier of the sticker set owner
   */
  user_id: number;

  /**
   * A PNG image with the thumbnail, must be up to 128 kilobytes in size and have width and height exactly 100px,
   * or a TGS animation with the thumbnail up to 32 kilobytes in size;
   * see https://core.telegram.org/animated_stickers#technical-requirements for animated sticker technical requirements.
   * 
   * Pass a `file_id` as a String to send a file that already exists on the Telegram servers,
   * pass an HTTP URL as a String for Telegram to get a file from the Internet,
   * or upload a new one using `multipart/form-data`.
   * 
   * Animated sticker set thumbnail can't be uploaded via HTTP URL.
   */
  thumb?: Interfaces.IInputFile | string;
}

/**
 * Use this method to send answers to an inline query.
 * 
 * On success, `True` is returned.
 * 
 * No more than **50** results per query are allowed.
 */
export interface IAnswerInlineQueryParams {
  /**
   * Unique identifier for the answered query
   */
  inline_query_id: string;

  /**
   * A JSON-serialized array of results for the inline query
   */
  result: Array<Interfaces.InlineQueryResult>;

  /**
   * The maximum amount of time in seconds that the result
   * of the inline query may be cached on the server.
   * Defaults to `300`.
   */
  cache_time?: number;

  /**
   * Pass `True`, if results may be cached on the server side only for the user that sent the query.
   * By default, results may be returned to any user who sends the same query
   */
  is_personal?: boolean;

  /**
   * Pass the offset that a client should send in the next query with the same text to receive more results.
   * Pass an empty string if there are no more results or if you don‘t support pagination.
   * Offset length can’t exceed 64 bytes.
   */
  next_offset?: string;

  /**
   * If passed, clients will display a button with specified text that switches the user to a private chat
   * with the bot and sends the bot a start message with the parameter `switch_pm_parameter`
   */
  switch_pm_text?: string;

  /**
   * Deep-linking parameter for the `/start` message sent to the bot when user presses the switch button.
   * 1-64 characters, only A-Z, a-z, 0-9, _ and - are allowed.
   */
  switch_pm_parameter?: string;
}

/**
 * Use this method to send invoices.
 * 
 * On success, the sent `Message` is returned.
 */
export interface ISendInvoiceParams {
  /**
   * Unique identifier for the target chat
   * or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: string | number;
  
  /**
   * Product name, 1-32 characters
   */
  title: string;

  /**
   * Product description, 1-255 characters
   */
  description: string;

  /**
   * Bot-defined invoice payload, 1-128 bytes.
   * This will not be displayed to the user,
   * use for your internal processes.
   */
  payload: string;

  /**
   * Payments provider token, obtained via Botfather
   */
  provider_token: string;

  /**
   * Unique deep-linking parameter that can be used to
   * generate this invoice when used as a start parameter
   */
  start_parameter: string;

  /**
   * Three-letter ISO 4217
   * [currency](https://core.telegram.org/bots/payments#supported-currencies) code
   */
  currency: string;

  /**
   * Price breakdown, a JSON-serialized list of components
   * (e.g. product price, tax, discount, delivery cost, delivery tax, bonus, etc.)
   */
  prices: Array<Interfaces.ILabeledPrice>;

  /**
   * JSON-encoded data about the invoice, which will be shared with the payment provider.
   * A detailed description of required fields should be provided by the payment provider.
   */
  provider_data?: string;

  /**
   * URL of the product photo for the invoice.
   * Can be a photo of the goods or a marketing image for a service.
   * People like it better when they see what they are paying for.
   */
  photo_url?: string;

  /**
   * Photo size
   */
  photo_size?: number;

  /**
   * Photo width
   */
  photo_width?: number;

  /**
   * Photo height
   */
  photo_height?: number;

  /**
   * Pass `True`, if you require the user's full name to complete the order
   */
  need_name?: boolean;

  /**
   * Pass `True`, if you require the user's phone number to complete the order
   */
  need_phone_number?: boolean;

  /**
   * Pass `True`, if you require the user's email address to complete the order
   */
  need_email?: boolean;

  /**
   * Pass `True`, if you require the user's shipping address to complete the order
   */
  need_shipping_address?: boolean;

  /**
   * Pass `True`, if user's phone number should be sent to provider
   */
  send_phone_number_to_provider?: boolean;

  /**
   * Pass `True`, if user's email address should be sent to provider
   */
  send_email_to_provider?: boolean;

  /**
   * Pass `True`, if the final price depends on the shipping method
   */
  is_flexible?: boolean;

  /**
   * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply,
   * ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating),
   * [custom reply keyboard](https://core.telegram.org/bots#keyboards),
   * instructions to remove reply keyboard or to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * If you sent an invoice requesting a shipping address
 * and the parameter `is_flexible` was specified,
 * the Bot API will send an Update with a `shipping_query` field to the bot.
 * Use this method to reply to shipping queries.
 * 
 * On success, `True` is returned.
 */
export type AnswerShippingQueryParams =
  | IAnswerShippingQuerySuccessParams
  | IAnswerShippingQueryErrorParams;

export interface IAnswerShippingQuerySuccessParams {
  /**
   * Unique identifier for the query to be answered
   */
  shipping_query_id: string;

  /**
   * Specify `True` if delivery to the specified address is possible
   * and `False` if there are any problems
   * (for example, if delivery to the specified address is not possible)
   */
  ok: true;

  /**
   * Required if `ok` is `True`.
   * 
   * A JSON-serialized array of available shipping options.
   */
  shipping_options: Array<Interfaces.IShippingOption>;
}

export interface IAnswerShippingQueryErrorParams {
  /**
   * Unique identifier for the query to be answered
   */
  shipping_query_id: string;

  /**
   * Specify `True` if delivery to the specified address is possible
   * and `False` if there are any problems
   * (for example, if delivery to the specified address is not possible)
   */
  ok: false;

  /**
   * Required if `ok` is `False`.
   * 
   * Error message in human readable form that explains why it is impossible to complete the order
   * (e.g. `Sorry, delivery to your desired address is unavailable`).
   * 
   * Telegram will display this message to the user.
   */
  error_message?: string;
}

/**
 * Once the user has confirmed their payment and shipping details,
 * the Bot API sends the final confirmation in the form of an `Update`
 * with the field `pre_checkout_query`.
 * Use this method to respond to such pre-checkout queries.
 * 
 * *puregram creator's note*: Bot API will trigger the `pre_checkout_query`
 * event and you need to handle it within 10 seconds using
 * `telegram.updates.on('pre_checkout_query', handler)`.
 * 
 * On success, `True` is returned.
 * 
 * **Note**: The Bot API must receive an answer within 10 seconds
 * after the pre-checkout query was sent.
 */
export type AnswerPreCheckoutQueryParams =
  | IAnswerPreCheckoutQuerySuccessParams
  | IAnswerPreCheckoutQueryErrorParams;

export interface IAnswerPreCheckoutQuerySuccessParams {
  /**
   * Unique identifier for the query to be answered
   */
  pre_checkout_query_id: string;

  /**
   * Specify `True` if everything is alright (goods are available, etc.)
   * and the bot is ready to proceed with the order.
   * Use `False` if there are any problems.
   */
  ok: true;
}

export interface IAnswerPreCheckoutQueryErrorParams {
  /**
   * Unique identifier for the query to be answered
   */
  pre_checkout_query_id: string;

  /**
   * Specify `True` if everything is alright (goods are available, etc.)
   * and the bot is ready to proceed with the order.
   * Use `False` if there are any problems.
   */
  ok: false;

  /**
   * Required if `ok` is `False`.
   * 
   * Error message in human readable form that explains the reason
   * for failure to proceed with the checkout
   * (e.g. `Sorry, somebody just bought the last of our amazing black T-shirts while you were busy filling out your payment details. Please choose a different color or garment!`).
   * Telegram will display this message to the user.
   */
  error_message: string;
}

/**
 * Informs a user that some of the Telegram Passport elements
 * they provided contains errors.
 * The user will not be able to re-submit their Passport to you
 * until the errors are fixed
 * (the contents of the field for which you returned the error must change).
 * 
 * Returns `True` on success.
 * 
 * Use this if the data submitted by the user doesn't satisfy the standards
 * your service requires for any reason.
 * For example, if a birthday date seems invalid,
 * a submitted document is blurry, a scan shows evidence of tampering, etc.
 * Supply some details in the error message to make sure the user knows
 * how to correct the issues.
 */
export interface ISetPassportDataErrorsParams {
  /**
   * User identifier
   */
  user_id: number;

  /**
   * A JSON-serialized array describing the errors
   */
  errors: Array<Interfaces.PassportElementError>;
}

/**
 * Use this method to send a game.
 * 
 * On success, the sent `Message` is returned.
 */
export interface ISendGameParams {
  /**
   * Unique identifier for the target chat
   */
  chat_id: number;

  /**
   * Short name of the game, serves as the unique identifier for the game.
   * Set up your games via Botfather.
   */
  game_short_name: string;

  /**
   * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply,
   * ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for
   * an [inline keyboard](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating),
   * [custom reply keyboard](https://core.telegram.org/bots#keyboards),
   * instructions to remove reply keyboard or to force a reply from the user.
   */
  reply_markup?: Types.ReplyMarkup;
}

/**
 * Use this method to set the score of the specified user in a game.
 * 
 * On success, if the message was sent by the bot,
 * returns the edited `Message`,
 * otherwise returns `True`.
 * 
 * Returns an error, if the new score is not greater than the user's current score
 * in the chat and force is `False`.
 */
export interface ISetGameScoreParams {
  /**
   * User identifier
   */
  user_id: number;

  /**
   * New score, must be non-negative
   */
  score: number;

  /**
   * Pass `True`, if the high score is allowed to decrease.
   * This can be useful when fixing mistakes or banning cheaters
   */
  force?: boolean;

  /**
   * Pass `True`, if the game message should not
   * be automatically edited to include the current scoreboard
   */
  disable_edit_message?: boolean;

  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Unique identifier for the target chat
   */
  chat_id?: number;

  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Identifier of the sent message
   */
  message_id?: number;

  /**
   * Required if `chat_id` and `message_id` are not specified.
   * 
   * Identifier of the inline message
   */
  inline_message_id?: string;
}

/**
 * Use this method to get data for high score tables.
 * Will return the score of the specified user and several
 * of his neighbors in a game.
 * 
 * On success, returns an `Array<GameHighScore>` objects.
 */
export interface IGetGameHighScoresParams {
  /**
   * Target user id
   */
  user_id: number;

  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Unique identifier for the target chat
   */
  chat_id?: number;

  /**
   * Required if `inline_message_id` is not specified.
   * 
   * Identifier of the sent message
   */
  message_id?: number;

  /**
   * Required if `chat_id` and `message_id` are not specified.
   * 
   * Identifier of the inline message
   */
  inline_message_id?: string;
}

/**
 * Use this method to specify a url and receive incoming updates
 * via an outgoing webhook.
 * Whenever there is an update for the bot, we will send an HTTPS POST
 * request to the specified url, containing a JSON-serialized `Update`.
 * In case of an unsuccessful request, we will give up after a reasonable
 * amount of attempts.
 * 
 * Returns `True` on success.
 * 
 * If you'd like to make sure that the Webhook request comes from Telegram,
 * we recommend using a secret path in the URL,
 * e.g. `https://www.example.com/<token>`
 * 
 * *Since nobody else knows your bot‘s token, you can be pretty sure it’s us*.
 */
export interface ISetWebhookParams {
  /**
   * HTTPS url to send updates to.
   * Use an empty string to remove webhook integration
   */
  url: string;

  /**
   * Upload your public key certificate so that the root certificate in use can be checked.
   */
  certificate?: Interfaces.IInputFile;

  /**
   * Maximum allowed number of simultaneous HTTPS connections to the webhook for update delivery,
   * 1-100.
   * Defaults to `40`.
   * Use lower values to limit the load on your bot‘s server,
   * and higher values to increase your bot’s throughput.
   */
  max_connections?: number;

  /**
   * A JSON-serialized list of the update types you want your bot to receive.
   * For example, specify `['message', 'edited_channel_post', 'callback_query']`
   * to only receive updates of these types.
   * Specify an empty list to receive all updates regardless of type (default).
   * If not specified, the previous setting will be used.
   */
  allowed_updates?: Array<Types.ContextPossibleTypes>
}
