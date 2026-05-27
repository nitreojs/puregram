export const GENERATED_BANNER = '<!-- generated from packages/api/schema — do not edit by hand -->'

// markdown table cells can't contain raw newlines or pipes
export function cell (text: string) {
  return text.replace(/\n/g, ' ').replace(/\|/g, '\\|')
}
