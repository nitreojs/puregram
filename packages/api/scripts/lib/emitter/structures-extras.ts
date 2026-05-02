// handcrafted members spliced onto generated wrapper classes (jsdoc + getter/method as raw ts).
// keyed by class name; only applied when the class exists in the schema
export const STRUCTURE_EXTRAS: Record<string, string[]> = {
  User: [
    `/**
 * display name; first name plus last name when present, otherwise just first name
 */
get displayName(): string {
    return this.raw.last_name ? \`\${this.raw.first_name} \${this.raw.last_name}\` : this.raw.first_name;
}`,
    `/**
 * render a clickable mention pointing at this user; defaults to 'html'
 */
mention(parseMode?: 'html' | 'markdown' | 'markdownv2'): string {
    const mode = parseMode ?? 'html';
    const name = this.raw.last_name
        ? \`\${this.raw.first_name} \${this.raw.last_name}\`
        : this.raw.first_name;
    const id = this.raw.id;
    if (mode === 'html') {
        const escaped = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return \`<a href="tg://user?id=\${id}">\${escaped}</a>\`;
    }
    if (mode === 'markdownv2') {
        const escaped = name.replace(/[_*[\\]()~\`>#+\\-=|{}.!\\\\]/g, '\\\\$&');
        return \`[\${escaped}](tg://user?id=\${id})\`;
    }
    const escaped = name.replace(/[[\\]\\\\]/g, '\\\\$&');
    return \`[\${escaped}](tg://user?id=\${id})\`;
}`
  ],

  Contact: [
    `/**
 * display name; first name plus last name when present, otherwise just first name
 */
get displayName(): string {
    return this.raw.last_name ? \`\${this.raw.first_name} \${this.raw.last_name}\` : this.raw.first_name;
}`
  ],

  File: [
    `/**
 * full download url for this file using the given bot token; undefined when file_path is missing
 */
link(token: string): string | undefined {
    return this.raw.file_path ? \`https://api.telegram.org/file/bot\${token}/\${this.raw.file_path}\` : undefined;
}`
  ],

  ChatMember: [
    `/**
 * true when the member's status is 'administrator'
 */
isAdmin(): boolean {
    return (this.raw as { status?: string }).status === 'administrator';
}`,
    `/**
 * true when the member's status is 'creator' (chat owner)
 */
isCreator(): boolean {
    return (this.raw as { status?: string }).status === 'creator';
}`,
    `/**
 * true when the member's status is 'member' (regular non-admin participant)
 */
isMember(): boolean {
    return (this.raw as { status?: string }).status === 'member';
}`
  ],

  Location: [
    `/**
 * tuple of [latitude, longitude]
 */
get coordinates(): [number, number] {
    return [this.raw.latitude, this.raw.longitude];
}`
  ]
}

export function renderStructureExtras (className: string, indent = '    ') {
  const extras = STRUCTURE_EXTRAS[className]

  if (!extras || extras.length === 0) {
    return ''
  }

  const indented = extras.map(snippet =>
    snippet
      .split('\n')
      .map(line => indent + line)
      .join('\n')
  )

  return indented.join('\n') + '\n'
}
