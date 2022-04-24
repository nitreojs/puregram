const escapeHtml = (source: string): string => (
  source.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
)

/** HTML reply markup */
export class HTML {
  static parseMode: 'HTML' = 'HTML'

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Escape all the danger characters */
  static raw(source: string): string {
    return escapeHtml(source)
  }

  /** Bold text */
  static bold(source: string): string {
    return `<b>${escapeHtml(source)}</b>`
  }

  /** Italic text */
  static italic(source: string): string {
    return `<i>${escapeHtml(source)}</i>`
  }

  /** Underlined text */
  static underline(source: string): string {
    return `<u>${escapeHtml(source)}</u>`
  }

  /** Strikethrough text */
  static strikethrough(source: string): string {
    return `<s>${escapeHtml(source)}</s>`
  }

  /** Spoilered text */
  static spoiler(source: string): string {
    return `<span class="tg-spoiler">${escapeHtml(source)}</span>`
  }

  /** URL with text */
  static url(source: string, link: string): string {
    return `<a href="${link}">${escapeHtml(source)}</a>`
  }

  /** Mention the user */
  static mention(source: string, id: number | string): string {
    return `<a href="tg://user?id=${id}">${escapeHtml(source)}</a>`
  }

  /** Preformatted code */
  static code(source: string, language?: string): string {
    const additional: string = (
      language
        ? ` class="language-${language}"`
        : ''
    )

    return `<code${additional}>${escapeHtml(source)}</code>`
  }

  /** Preformatted code */
  static pre(source: string): string {
    return `<pre>${escapeHtml(source)}</pre>`
  }
}
