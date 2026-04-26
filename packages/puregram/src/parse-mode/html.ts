const escapeHtml = (source: string) => (
  source.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
)

/** HTML parse mode */
export class HTML {
  static parseMode = 'HTML' as const

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Escape all the danger characters */
  static escape (source: string) {
    return escapeHtml(source)
  }

  /** @deprecated use `HTML.escape` instead */
  static raw (source: string) {
    return HTML.escape(source)
  }

  /** Bold text */
  static bold (source: string, escape = true) {
    return `<b>${escape ? HTML.escape(source) : source}</b>`
  }

  /** Italic text */
  static italic (source: string, escape = true) {
    return `<i>${escape ? HTML.escape(source) : source}</i>`
  }

  /** Underlined text */
  static underline (source: string, escape = true) {
    return `<u>${escape ? HTML.escape(source) : source}</u>`
  }

  /** Strikethrough text */
  static strikethrough (source: string, escape = true) {
    return `<s>${escape ? HTML.escape(source) : source}</s>`
  }

  /** Spoilered text */
  static spoiler (source: string, escape = true) {
    return `<span class="tg-spoiler">${escape ? HTML.escape(source) : source}</span>`
  }

  /** URL with text */
  static url (source: string, link: string, escape = true) {
    return `<a href="${link}">${escape ? HTML.escape(source) : source}</a>`
  }

  /** Mention the user */
  static mention (source: string, id: number | string, escape = true) {
    return `<a href="tg://user?id=${id}">${escape ? HTML.escape(source) : source}</a>`
  }

  /** Preformatted code */
  static code (source: string, escape = true) {
    return `<code>${escape ? HTML.escape(source) : source}</code>`
  }

  /** Preformatted code */
  static pre (source: string, language?: string, escape = true) {
    const string = escape ? HTML.escape(source) : source

    if (language !== undefined) {
      return `<pre><code class="language-${language}">${string}</code></pre>`
    }

    return `<pre>${string}</pre>`
  }

  /** Quotation */
  static blockquote (source: string, escape = true) {
    return `<blockquote>${escape ? HTML.escape(source) : source}</blockquote>`
  }

  /** Custom emoji */
  static emoji (emoji: string, id: string) {
    return `<tg-emoji emoji-id="${id}">${emoji}</tg-emoji>`
  }
}
