import Keyboard from '../src/attachments/keyboard';
import KeyboardBuilder from '../src/attachments/keyboard-builder';
import InlineKeyboard from '../src/attachments/inline-keyboard';
import InlineKeyboardBuilder from '../src/attachments/inline-keyboard-builder';
import RemoveKeyboard from '../src/attachments/remove-keyboard';

export type ChatTypes =
  | 'private' | 'group' | 'supergroup' | 'channel';

export type MessageEntityTypes =
  | 'mention' | 'hashtag' | 'cashtag' | 'bot_command'
  | 'url' | 'email' | 'phone_number' | 'bold'
  | 'italic' | 'code' | 'pre' | 'text_link'
  | 'text_mention';

export type ContextPossibleTypes =
  | 'message' | 'edited_message' | 'channel_post'
  | 'edited_channel_post' | 'inline_query' | 'chosen_inline_result'
  | 'callback_query' | 'shipping_query' | 'pre_checkout_query'
  | 'poll';

export type ParseModes = 'HTML' | 'Markdown';

export type AttachmentTypes =
  | 'animation' | 'audio' | 'contact'
  | 'document' | 'game' | 'location'
  | 'poll' | 'sticker' | 'venue'
  | 'video_note' | 'video' | 'voice';

export type ReplyMarkup =
  | InlineKeyboard
  | InlineKeyboardBuilder
  | Keyboard
  | KeyboardBuilder
  | RemoveKeyboard;
