import type { TelegramChatPermissions } from '@puregram/api'

import { type Camelize, unCamelize } from './camelize'

type ChatPermissionsCamel = Camelize<TelegramChatPermissions>

const ALL_KEYS: readonly (keyof TelegramChatPermissions)[] = [
  'can_send_messages',
  'can_send_audios',
  'can_send_documents',
  'can_send_photos',
  'can_send_videos',
  'can_send_video_notes',
  'can_send_voice_notes',
  'can_send_polls',
  'can_send_other_messages',
  'can_add_web_page_previews',
  'can_edit_tag',
  'can_change_info',
  'can_invite_users',
  'can_pin_messages',
  'can_manage_topics'
]

function fill (value: boolean) {
  const out: TelegramChatPermissions = {}

  for (const key of ALL_KEYS) {
    out[key] = value
  }

  return out
}

/**
 * static factories for `ChatPermissions` — passed to `restrictChatMember`,
 * `setChatPermissions`, `createChatInviteLink`. each factory returns an
 * exhaustive permissions object so partial overrides don't leave undefined
 * fields that telegram interprets ambiguously
 *
 * @example
 * ```ts
 * tg.api.setChatPermissions({ chat_id, permissions: ChatPermissions.allowAll() })
 *
 * // start from a deny-all baseline, allow only text
 * tg.api.restrictChatMember({
 *   chat_id, user_id,
 *   permissions: ChatPermissions.denyAll({ canSendMessages: true })
 * })
 * ```
 */
export class ChatPermissions {
  /** every permission set to true; pass overrides for fields to flip off */
  static allowAll (overrides: Partial<ChatPermissionsCamel> = {}): TelegramChatPermissions {
    return { ...fill(true), ...unCamelize(overrides) }
  }

  /** every permission set to false; pass overrides for fields to flip on */
  static denyAll (overrides: Partial<ChatPermissionsCamel> = {}): TelegramChatPermissions {
    return { ...fill(false), ...unCamelize(overrides) }
  }
}
