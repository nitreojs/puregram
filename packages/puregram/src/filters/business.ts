// business-account filter — gates on the `business_connection_id` field that
// bot-api attaches to messages received over a connected business account.
// the field lives on `TelegramMessage` (so any message-payload kind may carry
// it) and on `TelegramBusinessMessagesDeleted`; `TelegramBusinessConnection`
// uses a plain `id` field instead, so the `business_connection` update kind
// is intentionally excluded from the kind list

import { defineFilter } from '@puregram/api'
import type { BusinessMessageUpdate, DeletedBusinessMessagesUpdate, EditedBusinessMessageUpdate } from '@puregram/api'

type BusinessBearingUpdate =
  | BusinessMessageUpdate
  | EditedBusinessMessageUpdate
  | DeletedBusinessMessagesUpdate

const BUSINESS_KINDS = [
  'business_message',
  'edited_business_message',
  'deleted_business_messages'
] as const

/**
 * match updates that carry a `business_connection_id` payload field — messages
 * received over a connected business account. `business_connection` updates
 * are excluded since they expose the connection identifier on `id`, not
 * `business_connection_id`
 */
export const business = defineFilter<BusinessBearingUpdate, { raw: { business_connection_id: string } }>(
  'business',
  (u): u is BusinessBearingUpdate =>
    (u as { raw?: { business_connection_id?: unknown } }).raw?.business_connection_id != null,
  { kinds: BUSINESS_KINDS }
)
