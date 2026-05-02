import type { SchemaTypeRef } from '../schema-types'

// objects that get wrapper classes — those reached through update payloads or method
// return values. keep alphabetical for clean diffs
export const WRAPPED_STRUCTURES = [
  'Animation',
  'Audio',
  'Chat',
  'ChatBoost',
  'ChatBoostRemoved',
  'ChatBoostSource',
  'ChatBoostUpdated',
  'ChatInviteLink',
  'ChatJoinRequest',
  'ChatLocation',
  'ChatMember',
  'ChatMemberUpdated',
  'ChatPermissions',
  'ChatPhoto',
  'ChatShared',
  'ChosenInlineResult',
  'Contact',
  'Dice',
  'Document',
  'ExternalReplyInfo',
  'File',
  'ForumTopicCreated',
  'ForumTopicEdited',
  'ForwardedMessage',
  'Game',
  'Giveaway',
  'GiveawayCompleted',
  'GiveawayWinners',
  'InlineKeyboardButton',
  'InlineKeyboardMarkup',
  'InlineQuery',
  'Invoice',
  'LinkPreviewOptions',
  'Location',
  'MaskPosition',
  'Message',
  'MessageEntity',
  'MessageId',
  'MessageOrigin',
  'MessageReactionCountUpdated',
  'MessageReactionUpdated',
  'OrderInfo',
  'PassportData',
  'PhotoSize',
  'Poll',
  'PollAnswer',
  'PollOption',
  'PreCheckoutQuery',
  'ProximityAlertTriggered',
  'ReactionCount',
  'ShippingAddress',
  'ShippingQuery',
  'Sticker',
  'StickerSet',
  'Story',
  'SuccessfulPayment',
  'TextQuote',
  'User',
  'UserProfilePhotos',
  'UsersShared',
  'Venue',
  'Video',
  'VideoChatEnded',
  'VideoChatParticipantsInvited',
  'VideoChatScheduled',
  'VideoNote',
  'VideoQuality',
  'Voice',
  'WebAppData',
  'WebAppInfo',
  'WriteAccessAllowed'
] as const

export type WrappedStructureName = typeof WRAPPED_STRUCTURES[number]

export function isWrappedStructure (name: string) {
  return (WRAPPED_STRUCTURES as readonly string[]).includes(name)
}

// synthetic collection wrappers — `T[]` fields emit as a handcrafted wrapper class
// (e.g. `Photo` for `PhotoSize[]`). sources live in `packages/api/src/structures-handcrafted/`
export const ARRAY_WRAPPER_FOR: Record<string, string> = {
  PhotoSize: 'Photo',
  VideoQuality: 'VideoQualities'
}

export const ARRAY_WRAPPER_NAMES = Object.values(ARRAY_WRAPPER_FOR)

/** if `ref` is `T[]` where `T` has a synthetic collection wrapper, return its name */
export function arrayWrapperFor (ref: SchemaTypeRef) {
  if (ref.kind !== 'array') {
    return undefined
  }

  if (ref.of.kind !== 'reference') {
    return undefined
  }

  return ARRAY_WRAPPER_FOR[ref.of.name]
}
