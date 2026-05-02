import type { TelegramChatAdministratorRights } from '@puregram/api'

const REQUIRED_KEYS: readonly (keyof TelegramChatAdministratorRights)[] = [
  'is_anonymous',
  'can_manage_chat',
  'can_delete_messages',
  'can_manage_video_chats',
  'can_restrict_members',
  'can_promote_members',
  'can_change_info',
  'can_invite_users',
  'can_post_stories',
  'can_edit_stories',
  'can_delete_stories'
]

const OPTIONAL_KEYS: readonly (keyof TelegramChatAdministratorRights)[] = [
  'can_post_messages',
  'can_edit_messages',
  'can_pin_messages',
  'can_manage_topics',
  'can_manage_direct_messages',
  'can_manage_tags'
]

function fill (value: boolean, includeOptional: boolean) {
  const out = {} as TelegramChatAdministratorRights

  for (const key of REQUIRED_KEYS) {
    out[key] = value
  }

  if (includeOptional) {
    for (const key of OPTIONAL_KEYS) {
      out[key] = value
    }
  }

  return out
}

/**
 * static factories for `ChatAdministratorRights` — passed to `promoteChatMember`,
 * `setMyDefaultAdministratorRights`, etc. unlike `ChatPermissions`, several
 * fields here are mandatory (eleven of them); the optional fields apply only to
 * channels, supergroups, or groups respectively
 *
 * @example
 * ```ts
 * tg.api.setMyDefaultAdministratorRights({ rights: ChatAdministratorRights.denyAll() })
 *
 * // promote with all rights except anonymity
 * tg.api.promoteChatMember({
 *   chat_id, user_id,
 *   ...ChatAdministratorRights.allowAll({ is_anonymous: false })
 * })
 * ```
 */
export class ChatAdministratorRights {
  /** every right set to true; optional channel/group/supergroup fields included */
  static allowAll (overrides: Partial<TelegramChatAdministratorRights> = {}): TelegramChatAdministratorRights {
    return { ...fill(true, true), ...overrides }
  }

  /** every right set to false; optional fields are omitted entirely */
  static denyAll (overrides: Partial<TelegramChatAdministratorRights> = {}): TelegramChatAdministratorRights {
    return { ...fill(false, false), ...overrides }
  }
}
