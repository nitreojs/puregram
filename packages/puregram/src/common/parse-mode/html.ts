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
  static escape(source: string) {
    return escapeHtml(source)
  }

  /** @deprecated use `HTML.escape` instead */
  static raw(source: string) {
    return HTML.escape(source)
  }

  /** Bold text */
  static bold(source: string, escape: boolean = true) {
    return `<b>${escape ? HTML.escape(source) : source}</b>`
  }

  /** Italic text */
  static italic(source: string, escape: boolean = true) {
    return `<i>${escape ? HTML.escape(source) : source}</i>`
  }

  /** Underlined text */
  static underline(source: string, escape: boolean = true) {
    return `<u>${escape ? HTML.escape(source) : source}</u>`
  }

  /** Strikethrough text */
  static strikethrough(source: string, escape: boolean = true) {
    return `<s>${escape ? HTML.escape(source) : source}</s>`
  }

  /** Spoilered text */
  static spoiler(source: string, escape: boolean = true) {
    return `<span class="tg-spoiler">${escape ? HTML.escape(source) : source}</span>`
  }

  /** URL with text */
  static url(source: string, link: string, escape: boolean = true) {
    return `<a href="${link}">${escape ? HTML.escape(source) : source}</a>`
  }

  /** Mention the user */
  static mention(source: string, id: number | string, escape: boolean = true) {
    return `<a href="tg://user?id=${id}">${escape ? HTML.escape(source) : source}</a>`
  }

  /** Preformatted code */
  static code(source: string, language?: string, escape: boolean = true) {
    const additional: string = (
      language
        ? ` class="language-${language}"`
        : ''
    )

    return `<code${additional}>${escape ? HTML.escape(source) : source}</code>`
  }

  /** Preformatted code */
  static pre(source: string, escape: boolean = true) {
    return `<pre>${escape ? HTML.escape(source) : source}</pre>`
  }
}
