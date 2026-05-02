import { replaceChars } from './escape'

/** markdown parse mode */
export class Markdown {
  static parseMode = 'Markdown' as const

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** @deprecated use `Markdown.escape` instead */
  static raw (source: string) {
    return Markdown.escape(source)
  }

  /** escape all the danger characters */
  static escape (source: string) {
    return replaceChars(source, ['*', '_', '[', ']', '`'])
  }

  /** bold text */
  static bold (source: string, escape = true) {
    return `*${escape ? replaceChars(source, '*') : source}*`
  }

  /** italic text */
  static italic (source: string, escape = true) {
    return `_${escape ? replaceChars(source, '_') : source}_`
  }

  /** uRL with text */
  static url (source: string, link: string, escape = true) {
    return `[${escape ? replaceChars(source, '[]') : source}](${link})`
  }

  /** mention the user */
  static mention (source: string, id: number | string, escape = true) {
    return `[${escape ? replaceChars(source, '[]') : source}](tg://user?id=${id})`
  }

  /** preformatted code */
  static code (source: string, escape = true) {
    return `\`${escape ? replaceChars(source, '`') : source}\``
  }

  /** preformatted code */
  static pre (source: string, language?: string) {
    const quotes = '```'

    return `${quotes}${language ?? ''}\n${source}\n${quotes}`
  }
}
