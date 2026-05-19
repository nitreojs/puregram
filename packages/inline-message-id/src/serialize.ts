import { base64urlEncode, BinaryWriter } from './encoding'
import type { ParsedInlineMessageId } from './types'

/**
 * encodes a parsed inline message id back into the base64url string telegram
 * clients understand. inverse of {@link parseInlineMessageId} — round-trips
 * losslessly when fed an unmodified parsed value
 */
export function serializeInlineMessageId (parsed: ParsedInlineMessageId) {
  if (parsed.kind === 'legacy') {
    const writer = new BinaryWriter(20)

    writer.writeI32(parsed.dcId)
    writer.writeI64(parsed.id)
    writer.writeI64(parsed.accessHash)

    return base64urlEncode(writer.toBytes())
  }

  const writer = new BinaryWriter(24)

  writer.writeI32(parsed.dcId)
  writer.writeI64(parsed.ownerId)
  writer.writeI32(parsed.messageId)
  writer.writeI64(parsed.accessHash)

  return base64urlEncode(writer.toBytes())
}
