export const GENERATED_BANNER = '<!-- generated from packages/api/schema — do not edit by hand -->'

// schema descriptions contain literal <placeholder> text (e.g. <bot_username>) that
// vue's template compiler would parse as unclosed tags — escape angle brackets
export function escapeAngles (text: string) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// markdown table cells can't contain raw newlines or pipes
// escape backslashes before pipes so existing backslashes survive and the pipe-escaping backslash isn't double-escaped
export function cell (text: string) {
  return escapeAngles(text).replace(/\n/g, ' ').replace(/\\/g, '\\\\').replace(/\|/g, '\\|')
}
