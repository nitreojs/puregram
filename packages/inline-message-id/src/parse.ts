import { base64urlDecode, BinaryReader } from './encoding'
import { InlineMessageIdParseError } from './errors'
import type { ParsedInlineMessageId } from './types'

/**
 * decodes a telegram `inline_message_id` string into its raw fields.
 *
 * the input must be a base64url-encoded byte sequence of either 20 bytes
 * (legacy `inputBotInlineMessageID`) or 24 bytes (modern `inputBotInlineMessageID64`).
 *
 * @throws {InlineMessageIdParseError} when the input is empty, not valid base64url,
 *   or decodes to a byte length other than 20 or 24
 */
// eslint-disable-next-line local-rules/no-redundant-return-type -- discriminant union needs explicit kind to narrow
export function parseInlineMessageId (input: string): ParsedInlineMessageId {
  if (typeof input !== 'string' || input.length === 0) {
    throw new InlineMessageIdParseError('inline_message_id must be a non-empty string', input)
  }

  let bytes: Uint8Array

  try {
    bytes = base64urlDecode(input)
  } catch (_error) {
    throw new InlineMessageIdParseError('inline_message_id is not valid base64url', input)
  }

  if (bytes.byteLength !== 20 && bytes.byteLength !== 24) {
    throw new InlineMessageIdParseError(
      `inline_message_id must decode to 20 or 24 bytes, got ${bytes.byteLength}`,
      input
    )
  }

  const reader = new BinaryReader(bytes)

  if (bytes.byteLength === 20) {
    const dcId = reader.readI32()
    const id = reader.readI64()
    const accessHash = reader.readI64()

    return { kind: 'legacy', dcId, id, accessHash }
  }

  const dcId = reader.readI32()
  const ownerId = reader.readI64()
  const messageId = reader.readI32()
  const accessHash = reader.readI64()

  return { kind: 'modern', dcId, ownerId, messageId, accessHash }
}
