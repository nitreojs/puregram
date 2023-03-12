import { replaceChars } from '../../utils/helpers'

/** Markdown parse mode */
export class Markdown {
  static parseMode = 'Markdown' as const

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** @deprecated use `Markdown.escape` instead */
  static raw (source: string) {
    return Markdown.escape(source)
  }

  /** Escape all the danger characters */
  static escape (source: string) {
    return replaceChars(source, ['*', '_', '[', ']', '`'])
  }

  /** Bold text */
  static bold (source: string, escape = true) {
    return `*${escape ? replaceChars(source, '*') : source}*`
  }

  /** Italic text */
  static italic (source: string, escape = true) {
    return `_${escape ? replaceChars(source, '_') : source}_`
  }

  /** URL with text */
  static url (source: string, link: string, escape = true) {
    return `[${escape ? replaceChars(source, '[]') : source}](${link})`
  }

  /** Mention the user */
  static mention (source: string, id: number | string, escape = true) {
    return `[${escape ? replaceChars(source, '[]') : source}](tg://user?id=${id})`
  }

  /** Preformatted code */
  static code (source: string, escape = true) {
    return `\`${escape ? replaceChars(source, '`') : source}\``
  }

  /** Preformatted code */
  static pre (source: string, language?: string) {
    const quotes = '```'

    return `${quotes}${language || ''}\n${source}\n${quotes}`
  }
}
