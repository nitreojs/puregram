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