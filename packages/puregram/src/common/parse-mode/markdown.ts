import { replaceChars } from '../../utils/helpers'

/** Markdown parse mode */
export class Markdown {
  static parseMode: 'Markdown' = 'Markdown'

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Escape all the danger characters */
  static raw(source: string) {
    return replaceChars(source, ['*', '_', '[', ']', '`'])
  }

  /** Bold text */
  static bold(source: string) {
    return `*${replaceChars(source, '*')}*`
  }

  /** Italic text */
  static italic(source: string) {
    return `_${replaceChars(source, '_')}_`
  }

  /** URL with text */
  static url(source: string, link: string) {
    return `[${replaceChars(source, '[]')}](${link})`
  }

  /** Mention the user */
  static mention(source: string, id: number | string) {
    return `[${replaceChars(source, '[]')}](tg://user?id=${id})`
  }

  /** Preformatted code */
  static code(source: string) {
    return `\`${replaceChars(source, '`')}\``
  }

  /** Preformatted code */
  static pre(source: string, language?: string) {
    const quotes = '```'

    return `${quotes}${language || ''}\n${source}\n${quotes}`
  }
}
