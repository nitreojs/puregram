const escapeHtml = (source: string): string => (
  source.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
)

/** HTML parse mode */
export class HTML {
  static parseMode: 'HTML' = 'HTML'

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Escape all the danger characters */
  static raw(source: string) {
    return escapeHtml(source)
  }

  /** Bold text */
  static bold(source: string) {
    return `<b>${escapeHtml(source)}</b>`
  }

  /** Italic text */
  static italic(source: string) {
    return `<i>${escapeHtml(source)}</i>`
  }

  /** Underlined text */
  static underline(source: string) {
    return `<u>${escapeHtml(source)}</u>`
  }

  /** Strikethrough text */
  static strikethrough(source: string) {
    return `<s>${escapeHtml(source)}</s>`
  }

  /** Spoilered text */
  static spoiler(source: string) {
    return `<span class="tg-spoiler">${escapeHtml(source)}</span>`
  }

  /** URL with text */
  static url(source: string, link: string) {
    return `<a href="${link}">${escapeHtml(source)}</a>`
  }

  /** Mention the user */
  static mention(source: string, id: number | string) {
    return `<a href="tg://user?id=${id}">${escapeHtml(source)}</a>`
  }

  /** Preformatted code */
  static code(source: string, language?: string) {
    const additional: string = (
      language
        ? ` class="language-${language}"`
        : ''
    )

    return `<code${additional}>${escapeHtml(source)}</code>`
  }

  /** Preformatted code */
  static pre(source: string) {
    return `<pre>${escapeHtml(source)}</pre>`
  }
}
