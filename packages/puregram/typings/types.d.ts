import Keyboard from '../src/attachments/keyboard';
import KeyboardBuilder from '../src/attachments/keyboard-builder';
import InlineKeyboard from '../src/attachments/inline-keyboard';
import InlineKeyboardBuilder from '../src/attachments/inline-keyboard-builder';
import RemoveKeyboard from '../src/attachments/remove-keyboard';

import Interfaces from './interfaces';

export type ChatTypes =
  | 'private' | 'group' | 'supergroup' | 'channel';

export type MessageEntityTypes =
  | 'mention' | 'hashtag' | 'cashtag'      | 'bot_command'
  | 'url'     | 'email'   | 'phone_number' | 'bold'
  | 'italic'  | 'code'    | 'pre'          | 'text_link'
  | 'text_mention';

export type ContextPossibleTypes =
  | 'message'             | 'edited_message' | 'channel_post'
  | 'edited_channel_post' | 'inline_query'   | 'chosen_inline_result'
  | 'callback_query'      | 'shipping_query' | 'pre_checkout_query'
  | 'poll';

export type ParseModes = 'HTML' | 'Markdown';

export type AttachmentTypes =
  | 'animation'  | 'audio'   | 'contact'
  | 'document'   | 'game'    | 'location'
  | 'poll'       | 'sticker' | 'venue'
  | 'video_note' | 'video'   | 'voice';

export type ReplyMarkup =
  | InlineKeyboard
  | InlineKeyboardBuilder
  | Keyboard
  | KeyboardBuilder
  | RemoveKeyboard;

export type InlineKeyboardMarkup =
  | InlineKeyboard
  | InlineKeyboardBuilder;

export type PollTypes = 'regular' | 'quiz';

export type KeyboardButtonPollTypes = PollTypes;

export type PassportElements =
  | 'personal_details'      | 'passport'               | 'driver_license'
  | 'identity_card'         | 'internal_passport'      | 'address'
  | 'utility_bill'          | 'bank_statement'         | 'rental_agreement'
  | 'passport_registration' | 'temporary_registration' | 'phone_number'
  | 'email';

export type ChatActions =
  | 'typing'          | 'upload_photo'  | 'record_video'
  | 'upload_video'    | 'record_audio'  | 'upload_audio'
  | 'upload_document' | 'find_location' | 'record_video_note'
  | 'upload_video_note';

export type InputMedia =
  | Interfaces.IInputMediaPhoto
  | Interfaces.IInputMediaVideo
  | Interfaces.IInputMediaAudio
  | Interfaces.IInputMediaAnimation
  | Interfaces.IInputMediaDocument;

export type MaskPositions =
  | 'forehead' | 'eyes'
  | 'mouth'    | 'chin';

export type DocumentTypes = 'application/pdf' | 'application/zip';

export type VideoTypes = 'text/html' | 'video/mp4';

export type PassportElementDataErrors =
  | 'personal_details' | 'passport'          | 'driver_license'
  | 'identity_card'    | 'internal_passport' | 'address';

export type PassportElementFrontSideErrors =
  | 'passport' | 'driver_license' | 'identity_card'
  | 'internal_passport';

export type PassportElementReverseSideErrors = 'driver_license' | 'identity_card';

export type PassportElementSelfieErrors =
  | 'passport' | 'driver_license' | 'identity_card'
  | 'internal_passport';

export type PassportElementFileErrors =
  | 'utility_bill'          | 'bank_statement' | 'rental_agreement'
  | 'passport_registration' | 'temporary_registration';

export type PassportElementFilesErrors =
  | 'utility_bill'          | 'bank_statement' | 'rental_agreement'
  | 'passport_registration' | 'temporary_registration';

export type PassportElementTranslationFileErrors =
  | 'passport'          | 'driver_license'        | 'identity_card'
  | 'internal_passport' | 'utility_bill'          | 'bank_statement'
  | 'rental_agreement'  | 'passport_registration' | 'temporary_registration';

export type PassportElementTranslationFilesErrors =
  | 'passport'          | 'driver_license'        | 'identity_card'
  | 'internal_passport' | 'utility_bill'          | 'bank_statement'
  | 'rental_agreement'  | 'passport_registration' | 'temporary_registration';
