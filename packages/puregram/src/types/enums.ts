export enum AttachmentType {
  Animation = 'animation',
  Audio = 'audio',
  Contact = 'contact',
  Document = 'document',
  Location = 'location',
  Photo = 'photo',
  Poll = 'poll',
  Sticker = 'sticker',
  Story = 'story',
  Venue = 'venue',
  VideoNote = 'video_note',
  Video = 'video',
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
  ChatJoinRequest = 'chat_join_request',
  ChatMember = 'chat_member',
  MyChatMember = 'my_chat_member',
  ChosenInlineResult = 'chosen_inline_result',
  DeleteChatPhoto = 'delete_chat_photo',
  GroupChatCreated = 'group_chat_created',
  InlineQuery = 'inline_query',
  Invoice = 'invoice',
  LeftChatMember = 'left_chat_member',
  Location = 'location',
  MessageAutoDeleteTimerChanged = 'message_auto_delete_timer_changed',
  Message = 'message',
  ChannelPost = 'channel_post',
  EditedMessage = 'edited_message',
  EditedChannelPost = 'edited_channel_post',
  MessageReaction = 'message_reaction',
  MessageReactionCount = 'message_reaction_count',
  MigrateFromChatId = 'migrate_from_chat_id',
  MigrateToChatId = 'migrate_to_chat_id',
  NewChatMembers = 'new_chat_members',
  NewChatPhoto = 'new_chat_photo',
  NewChatTitle = 'new_chat_title',
  PassportData = 'passport_data',
  PinnedMessage = 'pinned_message',
  PollAnswer = 'poll_answer',
  Poll = 'poll',
  PreCheckoutQuery = 'pre_checkout_query',
  ProximityAlertTriggered = 'proximity_alert_triggered',
  WriteAccessAllowed = 'write_access_allowed',
  ForumTopicCreated = 'forum_topic_created',
  ForumTopicEdited = 'forum_topic_edited',
  ForumTopicClosed = 'forum_topic_closed',
  ForumTopicReopened = 'forum_topic_reopened',
  GeneralForumTopicHidden = 'general_forum_topic_hidden',
  GeneralForumTopicUnhidden = 'general_forum_topic_unhidden',
  ShippingQuery = 'shipping_query',
  SuccessfulPayment = 'successful_payment',
  UsersShared = 'users_shared',
  ChatShared = 'chat_shared',
  VideoChatEnded = 'video_chat_ended',
  VideoChatParticipantsInvited = 'video_chat_participants_invited',
  VideoChatScheduled = 'video_chat_scheduled',
  VideoChatStarted = 'video_chat_started',
  WebAppData = 'web_app_data',
  ServiceMessage = 'service_message',
  ChatBoost = 'chat_boost_updated',
  RemovedChatBoost = 'removed_chat_boost'
}

export enum ChatType {
  Private = 'private',
  Group = 'group',
  Supergroup = 'supergroup',
  Channel = 'channel'
}

export enum PollType {
  Regular = 'regular',
  Quiz = 'quiz'
}

export enum DiceEmoji {
  Dice = '🎲',
  Dart = '🎯',
  Basketball = '🏀',
  Football = '⚽',
  SlotMachine = '🎰',
  Bowling = '🎳'
}

export enum ChatAction {
  Typing = 'typing',
  UploadPhoto = 'upload_photo',
  RecordVideo = 'record_video',
  UploadVideo = 'upload_video',
  RecordVoice = 'record_voice',
  UploadVoice = 'upload_voice',
  RecordVideoNote = 'record_video_note',
  UploadVideoNote = 'upload_video_note',
  UploadDocument = 'upload_document',
  ChooseSticker = 'choose_sticker',
  FindLocation = 'find_location'
}

export enum ChatMemberStatus {
  Creator = 'creator',
  Administrator = 'administrator',
  Member = 'member',
  Restricted = 'restricted',
  Left = 'left',
  Kicked = 'kicked'
}

export enum MessageEntityType {
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
  Spoiler = 'spoiler',
  Code = 'code',
  Pre = 'pre',
  TextLink = 'text_link',
  TextMention = 'text_mention',
  CustomEmoji = 'custom_emoji'
}

export enum ParseMode {
  Markdown = 'Markdown',
  MarkdownV2 = 'MarkdownV2',
  HTML = 'HTML'
}

export enum StickerFormat {
  Static = 'static',
  Animated = 'animated',
  Video = 'video'
}

export enum StickerType {
  Regular = 'regular',
  Mask = 'mask',
  CustomEmoji = 'custom_emoji'
}

export enum BotCommandScopeType {
  Default = 'default',
  AllPrivateChats = 'all_private_chats',
  AllGroupChats = 'all_group_chats',
  AllChatAdministrators = 'all_chat_administrators',
  Chat = 'chat',
  ChatAdministrators = 'chat_administrators',
  ChatMember = 'chat_member'
}
