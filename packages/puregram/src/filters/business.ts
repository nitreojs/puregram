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
 * match updates carrying `business_connection_id` (messages over a connected
 * business account). `business_connection` updates are excluded — they expose
 * the connection id on `id`, not `business_connection_id`
 */
export const business = defineFilter<BusinessBearingUpdate, { businessConnectionId: string }>(
  'business',
  (u): u is BusinessBearingUpdate =>
    (u as { raw?: { business_connection_id?: unknown } }).raw?.business_connection_id != null,
  { kinds: BUSINESS_KINDS }
)
