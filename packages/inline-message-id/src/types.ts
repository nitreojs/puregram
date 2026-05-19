/** 20-byte form — `inputBotInlineMessageID` */
export interface LegacyInlineMessageId {
  kind: 'legacy'
  /** telegram data center id the message lives on */
  dcId: number
  /** packed long — high 32 bits = signed legacy chat id, low 32 bits = message id */
  id: bigint
  /** message access hash */
  accessHash: bigint
}

/** 24-byte form — `inputBotInlineMessageID64` */
export interface ModernInlineMessageId {
  kind: 'modern'
  /** telegram data center id the message lives on */
  dcId: number
  /** 64-bit owner id (user who chose the inline result) */
  ownerId: bigint
  /** message id */
  messageId: number
  /** message access hash */
  accessHash: bigint
}

/**
 * decoded representation of a telegram `inline_message_id` string.
 *
 * telegram emits two on-the-wire shapes:
 *
 * - **legacy (20 bytes)** — `inputBotInlineMessageID`. produced for messages
 *   sent into chats where the legacy 32-bit chat id was sufficient. `id` is the
 *   raw packed long; the high 32 bits encode the signed legacy chat id, the
 *   low 32 bits encode the message id
 * - **modern (24 bytes)** — `inputBotInlineMessageID64`. produced when the
 *   `owner_id` does not fit in int32 (post-64-bit user ids), or for inline
 *   bot-only contexts. `ownerId` and `messageId` are split into separate fields
 *
 * see https://core.telegram.org/api/links and tdlib's TL schema
 */
export type ParsedInlineMessageId =
  | LegacyInlineMessageId
  | ModernInlineMessageId
