import type { LegacyInlineMessageId, ModernInlineMessageId, ParsedInlineMessageId } from './types'

/** narrows a parsed value to the legacy 20-byte form */
export function isLegacyInlineMessageId (parsed: ParsedInlineMessageId): parsed is LegacyInlineMessageId {
  return parsed.kind === 'legacy'
}

/** narrows a parsed value to the modern 24-byte form */
export function isModernInlineMessageId (parsed: ParsedInlineMessageId): parsed is ModernInlineMessageId {
  return parsed.kind === 'modern'
}
