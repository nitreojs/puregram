export enum AttachmentType {
  Animation = 'animation',
  Audio = 'audio',
  Document = 'document',
  Photo = 'photo',
  Sticker = 'sticker',
  Video = 'video',
  VideoNote = 'video_note',
  Voice = 'voice'
}

export enum EntityType {
  Mention = 'mention',
  Hashtag = 'hashtag',
  Cashtag = 'cashtag',
  BotCommand = 'bot_command',
  Url = 'url',
  Email = 'email',
  PhoneNumber = 'phone_number',
  Bold = 'bold',
  Italic = 'italic',
  Underline = 'underline',
  Strikethrough = 'strikethrough',
  Code = 'code',
  Pre = 'pre',
  TextLink = 'text_link',
  TextMention = 'text_mention'
}

export enum UpdateType {
  CallbackQuery = 'callback_query',
  ChannelChatCreated = 'channel_chat_created',
  ChosenInlineResult = 'chosen_inline_result',
  DeleteChatPhoto = 'delete_chat_photo',
  GroupChatCreated = 'group_chat_created',
  InlineQuery = 'inline_query',
  Invoice = 'invoice',
  LeftChatMember = 'left_chat_member',
  Message = 'message',
  EditedMessage = 'edited_message',
  ChannelPost = 'channel_post',
  EditedChannelPost = 'edited_channel_post',
  MigrateToChatId = 'migrate_to_chat_id',
  MigrateFromChatId = 'migrate_from_chat_id',
  NewChatMembers = 'new_chat_members',
  NewChatPhoto = 'new_chat_photo',
  NewChatTitle = 'new_chat_title',
  PinnedMessage = 'pinned_message',
  Poll = 'poll',
  PollAnswer = 'poll_answer',
  ChatMember = 'chat_member',
  MyChatMember = 'my_chat_member',
  PreCheckoutQuery = 'pre_checkout_query',
  ShippingQuery = 'shipping_query',
  SuccessfulPayment = 'successful_payment',
  SupergroupChatCreated = 'supergroup_chat_created',
  MessageAutoDeleteTimerChanged = 'message_auto_delete_timer_changed',
  VideoChatScheduled = 'video_chat_scheduled',
  VideoChatStarted = 'video_chat_started',
  VideoChatEnded = 'video_chat_ended',
  VideoChatParticipantsInvited = 'video_chat_participants_invited',
  WebAppData = 'web_app_data',
  ChatJoinRequest = 'chat_join_request',
  ProximityAlertTriggered = 'proximity_alert_triggered',
  PassportData = 'passport_data',
  ServiceMessage = 'service_message'
}

export enum ChatType {
  Private = 'private',
  Group = 'group',
  Supergroup = 'supergroup',
  Channel = 'channel'
}
